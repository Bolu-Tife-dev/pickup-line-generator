"use client";

import { toast } from "sonner";
import GenerateFormButton from "../buttons/generate-form-button";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import Image from "next/image";

const MAX_FRAMES = 6;
const MAX_EDGE = 720; // px on the long edge — keeps payloads well under limit
const JPEG_QUALITY = 0.66;

async function downscaleToJpegDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<string> {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(source, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

// 1 image → [frame]; video → evenly-sampled frames from the first ~45s
async function extractFrames(file: File): Promise<string[]> {
  if (file.type.startsWith("image/")) {
    const url = URL.createObjectURL(file);
    try {
      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not read image"));
        img.src = url;
      });
      const dataUrl = await downscaleToJpegDataUrl(img, img.naturalWidth, img.naturalHeight);
      URL.revokeObjectURL(url);
      return [dataUrl];
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }
  }

  if (file.type.startsWith("video/")) {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    const url = URL.createObjectURL(file);
    try {
      video.src = url;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Could not read video"));
      });
      if (Number.isNaN(video.duration) || video.duration <= 0) {
        throw new Error("Video duration unavailable");
      }
      // Sample evenly across the first 45 seconds (or full clip if shorter)
      const span = Math.min(
        video.duration * 0.9,
        45,
      );
      const start = Math.min(video.duration * 0.05, 1);
      const count = Math.min(MAX_FRAMES, Math.max(3, Math.ceil(span / 8)));
      const frames: string[] = [];
      for (let i = 0; i < count; i++) {
        const t = start + (span * i) / Math.max(1, count - 1);
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          video.onseeked = done;
          video.currentTime = Math.min(t, video.duration - 0.05);
          setTimeout(done, 1500); // safety timeout per seek
        });
        const dataUrl = await downscaleToJpegDataUrl(
          video,
          video.videoWidth,
          video.videoHeight,
        );
        frames.push(dataUrl);
      }
      URL.revokeObjectURL(url);
      return frames;
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }
  }

  throw new Error("Please upload an image or a screen recording");
}

function ChatUploadForm({
  formAction,
  message,
  error,
}: {
  formAction: (payload: FormData) => void;
  message?: string;
  error?: string;
}) {
  const [frames, setFrames] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  if (message === "error") {
    toast.error("Failed to generate. Please try again.", {
      description: typeof error === "string" ? error : undefined,
    });
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setFileName(file.name);
    try {
      const extracted = await extractFrames(file);
      setFrames(extracted);
      toast.success(
        file.type.startsWith("video/")
          ? `Read ${extracted.length} frames from your recording`
          : "Screenshot ready!",
      );
    } catch (e) {
      setFrames([]);
      toast.error(
        e instanceof Error ? e.message : "Could not process that file",
      );
    } finally {
      setExtracting(false);
    }
  }

  function clearFile() {
    setFrames([]);
    setFileName(null);
  }

  return (
    <form
      className="flex w-full flex-col space-y-4 text-xl md:text-2xl"
      action={formAction}
    >
      <label
        htmlFor="chatFile"
        className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#A5455C]/50 bg-white/40 px-4 py-10 text-center transition active:scale-[0.99] md:py-12"
      >
        <span className="text-[#FF2157]">💌</span>
        <span className="block text-lg font-medium text-[#A5455C] md:text-xl">
          {fileName ? "Change screenshot / recording" : "Upload a chat screenshot or screen recording"}
        </span>
        <span className="block text-sm text-[#A5455C]/70">
          The AI will read the vibe and write your perfect next message
        </span>
        <input
          id="chatFile"
          name="chatFile"
          type="file"
          accept="image/*,video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={onFile}
        />
      </label>

      {extracting && (
        <p className="text-center text-base text-[#A5455C]/80">Processing file…</p>
      )}

      {frames.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto rounded-xl bg-white/50 p-2">
          {frames.map((f, i) => (
            <Image
              key={i}
              src={f}
              alt={`chat frame ${i + 1}`}
              width={72}
              height={72}
              unoptimized
              className="h-[72px] w-[72px] rounded-md object-cover"
            />
          ))}
          <button
            type="button"
            onClick={clearFile}
            className="ml-1 rounded-full bg-white px-3 py-1 text-sm text-[#FF2157] shadow"
          >
            ✕
          </button>
        </div>
      )}
      {frames.length > 0 && (
        <input type="hidden" name="chatFrames" value={JSON.stringify(frames)} />
      )}

      <Textarea
        id="crushDescription"
        name="crushDescription"
        rows={2}
        placeholder={"Optional: anything the AI should know? eg: we vibe on banter, I want to ask her out"}
        className="w-full resize-none placeholder:text-[#DCDCDC] focus:outline-none focus:ring-0 md:text-lg"
      />

      <div className="pt-2">
        <GenerateFormButton
          text={frames.length > 0 ? "Write My Perfect Reply ✨" : undefined}
          disabled={extracting}
        />
      </div>
    </form>
  );
}

export default ChatUploadForm;
