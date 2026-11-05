import React from "react";
import { useFormStatus } from "react-dom";
import GenerateButton from "./generate-cta-button";

function GenerateFormButton({
  text,
  formAction,
  disabled,
}: {
  text?: string;
  formAction?: (payload: FormData) => void;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <GenerateButton
      className="w-full"
      pending={pending}
      formAction={formAction}
      text={text}
      isServerAction
      disabled={disabled || pending}
    />
  );
}

export default GenerateFormButton;
