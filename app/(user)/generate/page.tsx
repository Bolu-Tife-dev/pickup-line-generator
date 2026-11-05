import SignOutButton from "@/components/auth/sign-out-button";
import PickupLineGenerator from "@/components/pickupline-generator";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
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
