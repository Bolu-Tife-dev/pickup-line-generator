interface FormInputProps {
  // JSON string of base64 data-URLs (client-extracted frames from a chat
  // screenshot/screen recording); empty in text-only mode
  chatFrames?: string;
  crushDescription?: string;
  style?: string;
}

interface GenerationParams {
  initialFormState: FormInputProps;
}

interface GenerateButtonProps {
  className?: string;
  text?: string;
  isServerAction?: boolean;
  pending?: boolean;
  disabled?: boolean;
  formAction?: (formData: FormData) => void | ((payload: FormData) => void);
}

interface GenerateOutputProps {
  prevState: GenerateOutputState;
  formData: FormData;
}

interface GenerateOutputState {
  message: string;
  pickupLines?: string[];
  InitialFormState?: FormInputProps;
  errors?: any;
  data?: any;
}

interface FormOutputProps {
  pickupLines: string[];
  InitialFormState?: FormInputProps;
}
