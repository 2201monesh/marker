# Marker Site Documentation

## Setup

```bash
npm install
npm run dev
```

### Local analytics testing

To enable Amplitude and HubSpot tracking on localhost:

```fish
set -x PUBLIC_ENABLE_ANALYTICS true; npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all Playwright tests |
| `npm run test:analytics` | Analytics tracking tests (Amplitude, HubSpot, cross-domain) |
| `npm run test:a11y` | Accessibility tests |
| `npm run test:forms-smoke` | Form submission smoke tests |
| `npm run test:not-found-smoke` | 404 page smoke test |
| `npm run test:broken-links` | Internal link validation |
| `npm run test:external-smoke` | External dependency smoke tests |

## HubSpot site header (info.onmarker.com)

The following HTML is injected into the `<head>` of `info.onmarker.com` via HubSpot's site header settings. It handles Termly consent, cross-domain consent sync, and Amplitude analytics (including session replay and meeting-booked identity resolution).

```html
<script src="https://app.termly.io/resource-blocker/12b5ead1-e229-43ff-a44c-1394e5dbbdd6?autoBlock=off&masterConsentsOrigin=https://onmarker.com"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    var iframe = document.createElement('iframe');
    iframe.src = 'https://onmarker.com/termly-consent-sync.html';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  });
</script>
<script src="https://cdn.amplitude.com/script/f5e0953df77a321bb7647f2268a9ed7b.js"></script>
<script>
  window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
  window.amplitude.init('f5e0953df77a321bb7647f2268a9ed7b', {
    optOut: true,
    fetchRemoteConfig: true,
    autocapture: {
      attribution: true,
      fileDownloads: true,
      formInteractions: true,
      pageViews: true,
      sessions: true,
      elementInteractions: true,
      networkTracking: true,
      webVitals: true,
      frustrationInteractions: {
        thrashedCursor: true,
        errorClicks: true,
        deadClicks: true,
        rageClicks: true
      }
    }
  });

  // Sync Amplitude opt-out state with Termly consent
  function syncAmplitudeConsent() {
    if (window.Termly && window.Termly.getConsentState) {
      var state = window.Termly.getConsentState();
      window.amplitude.setOptOut(!state.analytics);
      return true;
    }
    return false;
  }

  // Primary: listen for Termly consent events
  function onTermlyLoaded() {
    syncAmplitudeConsent();
    window.Termly.on('consent', function(data) {
      if (data && data.consentState) {
        window.amplitude.setOptOut(!data.consentState.analytics);
      }
    });
  }

  // Fallback: poll for consent sync iframe to finish
  var pollCount = 0;
  var pollInterval = setInterval(function() {
    pollCount++;
    if (syncAmplitudeConsent() || pollCount >= 10) {
      clearInterval(pollInterval);
    }
  }, 1000);

  // Identity resolution: link anonymous Amplitude user to email on meeting booking
  window.addEventListener('message', function(event) {
    if (
      event.data.meetingBookSucceeded &&
      window.amplitude &&
      !window.amplitude.getOptOut()
    ) {
      try {
        var email = event.data.meetingsPayload.bookingResponse.postResponse.contact.email;
        if (email) {
          amplitude.setUserId(email);
          amplitude.track('Meeting Booked');
        }
      } catch(e) {
        amplitude.track('Meeting Booked');
      }
    }
  });
</script>
```

### Cookie consent management

Both onmarker.com and info.onmarker.com use Termly for cookie consent. onmarker.com is the master consent origin. Consent syncs to info.onmarker.com via a hidden iframe loading `/termly-consent-sync.html`.

Returning visitors can manage their cookie preferences via the "Manage Cookies" link in the footer of both sites. This calls `displayPreferenceModal()` to reopen the consent modal.

On info.onmarker.com, Amplitude initializes with `optOut: true` and only starts sending events after Termly confirms analytics consent. A polling fallback handles the case where the consent sync iframe finishes after Termly has already initialized.

## Decisions

Architectural Decision Records (ADRs) are in [decisions/](./decisions/).

After completing significant work, run `/update-docs` to analyze recent changes and suggest documentation updates.
