# 2. Client-Side Identity Resolution Between Amplitude and HubSpot

Date: 2026-03-19

## Status

Accepted

## Context

We use Amplitude for behavioral analytics (page views, sessions, user journeys) and HubSpot as our CRM (contacts, form submissions, email campaigns). Both run on onmarker.com and info.onmarker.com (HubSpot-hosted). When a visitor browses the site and then submits a form, we want to link their anonymous Amplitude browsing history to their known identity (email).

The challenge: Amplitude tracks anonymous users by `deviceId`. HubSpot captures email on form submission. These two systems don't natively share identity on our Starter plan.

We evaluated three approaches.

## Approaches Considered

### 1. Client-side postMessage listener (chosen)

For the newsletter form on onmarker.com (`src/components/NewsletterForm.tsx`), call `amplitude.setUserId(email)` directly in the form success handler. This is fully in our control using documented APIs.

For the meeting booking form on info.onmarker.com, listen for HubSpot's `meetingBookSucceeded` postMessage event from the meeting iframe. Extract the email from the payload and call `amplitude.setUserId(email)`. Amplitude automatically merges the anonymous `deviceId` history with the identified user.

The `meetingBookSucceeded` event is widely used in production (GTM conversion tracking, GA4), but the nested payload path to the contact email (`event.data.meetingsPayload.bookingResponse.postResponse.contact.email`) is undocumented by HubSpot. It was added after community requests and is confirmed working as of early 2025. We wrap it in a try/catch so that if HubSpot changes the payload structure, we still track the event without the identity link.

### 2. Pass Amplitude deviceId to HubSpot, then resolve server-side

Store Amplitude's `deviceId` on the HubSpot contact record (via a custom contact property and the HubSpot tracking API `_hsq.push(['identify', { amplitude_device_id: '...' }])`). When HubSpot creates a contact on form submission, it merges the anonymous visitor data (including the `deviceId` property) with the new contact. A server-side webhook (Firebase Cloud Function) then receives the form submission from HubSpot with both the email and `deviceId`, and calls Amplitude's HTTP API to link them.

This approach uses only documented APIs on both sides. It requires: a custom HubSpot contact property (`amplitude_device_id`), a script on info.onmarker.com that fires the `deviceId` to HubSpot's tracking API on page load, a HubSpot private app with a webhook subscription for contact creation events, and a Firebase Cloud Function to receive the webhook and call Amplitude's Identify/Track API.

We did not choose this because it adds infrastructure (Cloud Function, webhook subscription, custom HubSpot property) for the same end result.

### 3. Hidden form field with deviceId

Add Amplitude's `deviceId` as a hidden field on the HubSpot form. On form submission, the `deviceId` is stored on the contact record, then resolved server-side.

We ruled this out because HubSpot meeting booking forms (which render in an iframe from meetings.hubspot.com) do not support hidden fields or the `onFormReady` callback. Regular HubSpot forms do support this, but we use a meeting form. Changing to a form-first flow (regular form, then redirect to meeting scheduler) would alter the UX we prefer (calendar picker first, then contact details).

## Decision

Use client-side identity resolution via `amplitude.setUserId(email)`:
- Newsletter form (onmarker.com): call `setUserId` in the React success handler
- Meeting form (info.onmarker.com): listen for `meetingBookSucceeded` postMessage, extract email, call `setUserId`

## Consequences

- **Good**: Zero additional infrastructure. No Cloud Functions, webhooks, or custom HubSpot properties.
- **Good**: Amplitude automatically merges anonymous browsing history with the identified user via the shared `deviceId` in the browser session.
- **Good**: Cross-domain tracking (passing `ampDeviceId` in URL params from onmarker.com to info.onmarker.com) ensures the session is continuous across both domains.
- **Trade-off**: The meeting form email extraction relies on an undocumented HubSpot postMessage payload path. If it breaks, meeting bookings will still be tracked as events but won't be linked to an identified user.
- **Trade-off**: Identity resolution only works when the user submits a form in the same browser session as their browsing. If they browse on one device and submit on another, the histories won't merge.

## Future: Server-Side Fallback

If the client-side approach proves unreliable, switch to Approach 2:

1. Create a custom HubSpot contact property: `amplitude_device_id` (single-line text)
2. On info.onmarker.com, fire `_hsq.push(['identify', { amplitude_device_id: amplitude.getDeviceId() }])` on page load
3. Create a HubSpot private app with a webhook subscription for contact creation events
4. Deploy a Firebase Cloud Function that receives the webhook payload (containing email + `amplitude_device_id`) and calls Amplitude's HTTP API:
   ```json
   {
     "api_key": "YOUR_API_KEY",
     "events": [{
       "user_id": "user@example.com",
       "device_id": "the-device-id-from-hubspot",
       "event_type": "Form Submitted"
     }]
   }
   ```
5. This links the anonymous deviceId to the known userId on Amplitude's backend

## References

- `src/components/Analytics.astro`: Cross-domain tracking and hostname guards
- `src/components/NewsletterForm.tsx:32-35`: Client-side `setUserId` on newsletter submission
- HubSpot meeting postMessage: community-documented, used for GTM/GA4 conversion tracking
- Amplitude identity resolution: `setUserId()` triggers automatic merge of anonymous `deviceId` history
