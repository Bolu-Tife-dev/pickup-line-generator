import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Notice | Pickup Line Generator",
  description: "How Pickup Line Generator handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#FED8D8] px-safe pt-safe pb-safe">
      <div className="mx-auto w-full max-w-2xl px-6 py-10 text-[#A5455C]">
        <Link
          href="/"
          className="text-sm underline underline-offset-4 opacity-80"
        >
          ← Back home
        </Link>
        <h1 className="mt-4 mb-6 text-3xl">Privacy Notice</h1>

        <div className="space-y-5 text-base leading-relaxed md:text-lg">
          <p>Last updated: November 7, 2026.</p>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">What we collect</h2>
            <p>
              We don&apos;t require an account and we don&apos;t collect any
              personal information from you — no sign-up, no profile, no
              email. You just open the app and use it.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">
              Chat screenshots &amp; screen recordings
            </h2>
            <p>
              If you upload a chat screenshot or screen recording, it is sent
              to our AI providers (Google Gemini and Groq) to analyze the
              conversation and generate your reply. The images are processed
              for that request only — they are not stored by us, and we never
              sell them or share them with third parties for advertising.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Analytics</h2>
            <p>
              We use Plausible Analytics, a privacy-friendly, cookie-free
              tool. It does not track you across sites and does not collect
              personal data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Cookies</h2>
            <p>
              We don&apos;t use cookies at all — no sign-in sessions, no
              advertising, no cross-site tracking.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Your data</h2>
            <p>
              We do not sell your personal data. Since we don&apos;t store
              personal data, there is nothing on file to delete on request.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Changes</h2>
            <p>
              If this notice changes in a meaningful way, we will update this
              page. Questions? Reach out anytime.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm opacity-80">
          See also our{" "}
          <Link href="/terms" className="underline underline-offset-4">
            Terms of Use
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
