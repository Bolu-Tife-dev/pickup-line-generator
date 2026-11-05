import Image from "next/image";
import Link from "next/link";

export default function Offline() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#FED8D8] p-8 text-center">
      <Image src="/ph_heart-fill.svg" alt="broken heart" width={64} height={64} />
      <h1 className="text-2xl text-white">You are offline</h1>
      <p className="text-lg text-[#A5455C]">
        The Pickup Line Generator needs an internet connection.
        Reconnect and try again.
      </p>
      <Link href="/" className="rounded-full bg-white px-6 py-3 text-lg text-[#FF2157]">
        Try again
      </Link>
    </main>
  );
}
