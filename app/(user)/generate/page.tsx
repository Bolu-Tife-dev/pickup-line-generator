import SignOutButton from "@/components/auth/sign-out-button";
import PickupLineGenerator from "@/components/pickupline-generator";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { redirect } from "next/navigation";

// Vision calls can take a while — extend the Vercel function budget
export const maxDuration = 60;

// Cap the auth check: if Supabase is unreachable, auth-js retries can take
// tens of seconds. Treat a timeout like "not logged in" → login page.
const AUTH_CHECK_TIMEOUT_MS = 8000;

export default async function Page() {
  const supabase = createClient();

  let timer: ReturnType<typeof setTimeout> | undefined;
  type AuthResult = Awaited<ReturnType<typeof supabase.auth.getUser>>;
  let auth: AuthResult;
  try {
    auth = await Promise.race([
      supabase.auth.getUser(),
      new Promise<AuthResult>((resolve) => {
        timer = setTimeout(
          () =>
            resolve({
              data: { user: null, session: null },
              error: new Error("Auth check timed out"),
            } as unknown as AuthResult),
          AUTH_CHECK_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
  const { data, error } = auth;
  if (error || !data?.user) {
    redirect("/login");
  }
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <div className="absolute inset-0">
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="object-cover object-center"
          quality={100}
          priority
        />
      </div>

      {/* Semi-transparent overlay to ensure text readability */}
      <div className="absolute inset-0 bg-white bg-opacity-90"></div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center px-safe pt-safe pb-safe p-8 text-center">
        <SignOutButton />
        <PickupLineGenerator />
      </div>
    </div>
  );
}
