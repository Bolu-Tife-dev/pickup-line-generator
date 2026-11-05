"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "./server";

// Build the OAuth callback from the incoming request so the redirect always
// points at whichever host served the page (production domain on Vercel,
// localhost:3000 during local development). Do NOT rely on NEXT_PUBLIC_APP_URL
// being inlined correctly at build time.
function currentOrigin(headersList: Headers): string {
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function Login(formData: FormData) {
  const supabase = createClient();
  const headersList = headers();

  // Sign in with OAuth - Google
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${currentOrigin(headersList)}/auth/callback`,
    },
  });

  if (error) {
    redirect("/error");
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut(formData: FormData) {
  const supabase = createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
