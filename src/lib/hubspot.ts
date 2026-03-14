const PORTAL_ID = "245531796";

export const HUBSPOT_FORMS = {
  newsletter: "f78561f6-b5c8-4481-bdb4-df3bb35851e7",
  bookDemo: "d6ec765a-9d4f-43b7-91ad-93f5741806b7",
} as const;

interface HubSpotField {
  objectTypeId: string;
  name: string;
  value: string;
}

export async function submitHubSpotForm(
  formGuid: string,
  fields: HubSpotField[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${formGuid}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields,
          context: {
            pageUri: window.location.href,
            pageName: document.title,
          },
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return {
        success: false,
        error: data?.message || "Something went wrong. Please try again.",
      };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}
