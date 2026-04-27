const PORTAL_ID = "245531796";

export const HUBSPOT_FORMS = {
  newsletter: "f78561f6-b5c8-4481-bdb4-df3bb35851e7",
  superpowersTrial: "c01212d6-7c18-45bf-a0d8-1190ac3368b8",
} as const;

interface HubSpotField {
  objectTypeId: string;
  name: string;
  value: string;
}

function getCookie(name: string): string | undefined {
  const cookies = document.cookie.split("; ");
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match?.split("=")[1];
}

export async function submitHubSpotForm(
  formGuid: string,
  fields: HubSpotField[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const hutk = getCookie("hubspotutk");

    const response = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${formGuid}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields,
          context: {
            ...(hutk ? { hutk } : {}),
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
