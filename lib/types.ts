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

// Tone of the uploaded chat conversation, read off the screenshots/recording
// by the vision model before it writes the replies.
interface ChatVibe {
  // Short label: "Cold", "Nonchalant", "Flirty", "Calm", "Mixed", ...
  mood: string;
  // 1-2 sentence explanation referencing what actually happens in the chat
  summary: string;
}

// What a generation call hands back: always the lines, plus the vibe when the
// input was a chat screenshot/screen recording (text mode has no chat to read).
interface GenerationResult {
  lines: string[];
  vibe?: ChatVibe;
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
  vibe?: ChatVibe;
  InitialFormState?: FormInputProps;
  errors?: any;
  data?: any;
}

interface FormOutputProps {
  pickupLines: string[];
  vibe?: ChatVibe;
  InitialFormState?: FormInputProps;
}
