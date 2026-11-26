import PickupLineGenerator from "@/components/pickupline-generator";
import Image from "next/image";

// Vision calls can take a while — extend the Vercel function budget
export const maxDuration = 60;

// Auth-free: the generator is open to anyone (single-user app — see README).
export default function Page() {
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
        <PickupLineGenerator />
      </div>
    </div>
  );
}
