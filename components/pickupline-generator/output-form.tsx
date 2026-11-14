import { regenerateOutput } from "@/lib/ai/actions";
import { copyToClipboard } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import GenerateFormButton from "../buttons/generate-form-button";
import { Card, CardContent } from "../ui/card";

function OutputForm({ pickupLines, vibe, InitialFormState }: FormOutputProps) {
  const initialState: GenerateOutputState = {
    message: "",
    InitialFormState: InitialFormState,
    pickupLines: pickupLines,
    vibe: vibe,
  };

  const [state, formAction] = useFormState(regenerateOutput, initialState);

  const currentPickupLines = state.pickupLines || pickupLines;
  const currentVibe = state.vibe || vibe;

  if (state.message === "error" && state.errors) {
    toast.error("Error regenerating pickup lines.", {
      description: state.errors,
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      {currentVibe && (
        <Card className="border-2 border-[#FF2157] bg-white text-left">
          <CardContent className="py-5 px-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-xl md:text-2xl text-[#B5002C]">Chat vibe</h3>
              <span className="shrink-0 rounded-full bg-[#FF2157] px-3 py-1 text-sm font-medium text-white">
                {currentVibe.mood}
              </span>
            </div>
            {currentVibe.summary && (
              <p className="mt-2 text-lg text-[#FF6A8E] text-left">
                {currentVibe.summary}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <h2 className="text-center text-xl text-[#A5455C] mb-4">
        Copy the below pick up lines
      </h2>

      {currentPickupLines.map((line, index) => (
        <Card key={index} className="border-2 border-[#FF2157] bg-white">
          <CardContent className="py-5 px-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xl md:text-2xl text-[#B5002C]">
                Pickup line {index + 1}
              </h3>
              <button onClick={() => copyToClipboard(line)}>
                <Image src="/copy.svg" alt="copy" width={20} height={20} />
              </button>
            </div>
            <p className="mt-2 text-lg text-[#FF6A8E] text-left">{line}</p>
          </CardContent>
        </Card>
      ))}
      <form className="pt-4">
        <GenerateFormButton
          text="Regenerate Pickup Line"
          formAction={formAction}
        />
      </form>
    </div>
  );
}

export default OutputForm;
