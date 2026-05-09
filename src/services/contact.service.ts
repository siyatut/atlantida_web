import { strapiApiUrl } from "../config/catalog";

type ContactPayload = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  const response = await fetch(`${strapiApiUrl}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Contact form submit failed: ${response.status} ${body}`);
  }
}
