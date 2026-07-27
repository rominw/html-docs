import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBindingEnv } from "@/db";

export type ChatGPTUser = {
  displayName: string;
  email: string;
};

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  if (!email) return null;

  const encodedName = requestHeaders.get("oai-authenticated-user-full-name");
  const encoding = requestHeaders.get(
    "oai-authenticated-user-full-name-encoding",
  );
  let displayName = email;
  if (encodedName && encoding === "percent-encoded-utf-8") {
    try {
      displayName = decodeURIComponent(encodedName);
    } catch {
      displayName = email;
    }
  }
  return { email, displayName };
}

export async function requireAdmin(returnTo = "/admin") {
  const user = await getChatGPTUser();
  if (!user) {
    redirect(`/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`);
  }

  const adminEmail = getBindingEnv().ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || user.email.toLowerCase() !== adminEmail) {
    return { user, authorized: false as const };
  }
  return { user, authorized: true as const };
}

export async function isAdmin() {
  const user = await getChatGPTUser();
  const adminEmail = getBindingEnv().ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(
    user && adminEmail && user.email.toLowerCase() === adminEmail,
  );
}
