import React from "react";
import { useFormStatus } from "react-dom";
import GenerateButton from "./generate-cta-button";

function GenerateFormButton({
  text,
  formAction,
  disabled,
  pendingHint,
}: {
  text?: string;
  formAction?: (payload: FormData) => void;
  disabled?: boolean;
  pendingHint?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-col gap-2">
      <GenerateButton
        className="w-full"
        pending={pending}
        formAction={formAction}
        text={text}
        isServerAction
        disabled={disabled || pending}
      />
      {pending && pendingHint && (
        <p className="text-center text-sm text-[#A5455C]/80 md:text-base">
          {pendingHint}
        </p>
      )}
    </div>
  );
}

export default GenerateFormButton;
