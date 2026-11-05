"use server";

import { setTimeout } from "timers/promises";
import Instructor from "@instructor-ai/instructor";
import { OpenAI } from "openai";
import { FallbackOutputSchema, OutputSchema } from "../schema";
import { rateLimiter } from "../upstash";
import { parseFormData, parsePickupLineTexts } from "../utils";
import {
  chatAnalysisFallbackPrompt,
  chatAnalysisInstructions,
  experimentPrompt,
  promptInstructions,
} from "./instructions";

// Export runtime budget for Vercel (vision calls can take a while)

// Google Gemini (free tier via AI Studio) — OpenAI-compatible endpoint,
// used for BOTH vision (chat screenshot analysis) and text fallback
const gemini = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY!,
});

// Groq (free tier) — fast text-only fallback when no images are attached
const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY!,
});

// Instructor for returning structured JSON
const client = Instructor({
  client: gemini,
  mode: "JSON_SCHEMA",
});

function parseChatFrames(chatFrames?: string): string[] {
  if (!chatFrames) return [];
  try {
    const parsed = JSON.parse(chatFrames);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (f) => typeof f === "string" && f.startsWith("data:image/"),
      )
    ) {
      return parsed as string[];
    }
    return [];
  } catch {
    return [];
  }
}

type VisionContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type VisionMessage = {
  role: "system" | "user" | "assistant";
  content: string | VisionContentPart[];
};

function buildVisionMessages(
  frames: string[],
  note?: string,
): VisionMessage[] {
  const userNote = note?.trim()
    ? `\nExtra context from the user: "${note.trim().slice(0, 500)}"`
    : "";
  return [
    {
      role: "system",
      content: chatAnalysisInstructions,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Here ${frames.length === 1 ? "is 1 screenshot" : `are ${frames.length} frames`} of my chat conversation. Analyze it and write my perfect next message as described.${userNote}`,
        },
        ...frames.map((dataUrl) => ({
          type: "image_url" as const,
          image_url: { url: dataUrl },
        })),
      ],
    },
  ];
}

// IMAGE MODE — screenshot / screen recording analysis (primary, structured)
async function analyzeChatAndGenerate(
  frames: string[],
  note?: string,
): Promise<string[]> {
  const PickupLines = await client.chat.completions.create({
    model: "gemini-3.1-flash-lite",
    messages: buildVisionMessages(frames, note),
    response_model: { schema: OutputSchema, name: "PickupLines" },
    max_tokens: 2000,
    max_retries: 2,
    temperature: 1,
  });
  return parsePickupLineTexts(PickupLines);
}

// IMAGE MODE — raw fallback (manual JSON parse + validation)
async function fallbackAnalyzeChat(
  frames: string[],
  note?: string,
): Promise<string[]> {
  const messages = [
    {
      role: "system" as const,
      content:
        "Given the attached images, you will return fully valid JSON based on the description below. You will return no other prose. Return a valid and fully escaped JSON object that matches the schema.",
    },
    {
      role: "system" as const,
      content: chatAnalysisFallbackPrompt,
    },
    ...buildVisionMessages(frames, note).slice(1),
  ];
  const response = await gemini.chat.completions.create({
    model: "gemini-3.1-flash-lite",
    // The OpenAI v4 types are stricter than Gemini's OpenAI-compatible API
    // eslint-disable-next-line
    messages: messages as any,
    response_format: { type: "json_object" },
    max_tokens: 2000,
    temperature: 1.2,
    top_p: 1,
  });
  try {
    const parsedJson = JSON.parse(response.choices[0].message.content!);
    const pickupLines = FallbackOutputSchema.parse(parsedJson);
    return pickupLines.pickupLines;
  } catch (error) {
    throw new Error(
      "Try Again - Error parsing JSON response from fallback API",
    );
  }
}

// TEXT MODE — no screenshot, optional note only (primary: Groq, free + fast)
async function generatePickupLines(
  formData: FormInputProps,
): Promise<string[]> {
  const note = formData.crushDescription?.trim() || "";
  const direct = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: promptInstructions },
      {
        role: "user",
        content: `Description of my crush: ${note}\nStyle of pickup lines: ${
          formData.style || "natural to the context"
        }`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4000,
    temperature: 1,
  });
  const parsed = FallbackOutputSchema.parse(
    JSON.parse(direct.choices[0].message.content!),
  );
  return parsed.pickupLines;
}

// TEXT MODE — Gemini fallback (raw JSON mode, parsed + validated manually)
async function fallbackGeneratePickupLines(
  formData: FormInputProps,
): Promise<string[]> {
  const note = formData.crushDescription?.trim() || "";
  const response = await gemini.chat.completions.create({
    model: "gemini-3.1-flash-lite",
    messages: [
      {
        role: "system",
        content:
          "\n" +
          "          Given a user prompt, you will return fully valid JSON based on the following description.\n" +
          "          You will return no other prose. You will take into account any descriptions or required parameters within the schema\n" +
          "          and return a valid and fully escaped JSON object that matches the schema and those instructions.\n" +
          "\n" +
          "          description: \n" +
          "        ",
      },
      { role: "system", content: experimentPrompt },
      {
        role: "user",
        content: `Description of my crush: ${note}\nStyle of pickup lines: ${
          formData.style || "natural to the context"
        }`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000,
    temperature: 1.5,
    top_p: 1,
    frequency_penalty: 0.6,
  });
  try {
    const parsedJson = JSON.parse(response.choices[0].message.content!);
    const pickupLines = FallbackOutputSchema.parse(parsedJson);
    return pickupLines.pickupLines;
  } catch (error) {
    throw new Error(
      "Try Again - Error parsing JSON response from fallback API",
    );
  }
}

// Route to the right pipeline based on the presence of chat screenshots
async function generatePickupLinesWithFallback(
  params: GenerationParams,
): Promise<string[]> {
  const frames = parseChatFrames(params.initialFormState.chatFrames);
  const inImageMode = frames.length > 0;

  const primaryPromise = !inImageMode
    ? generatePickupLines(params.initialFormState)
    : analyzeChatAndGenerate(
        frames,
        params.initialFormState.crushDescription,
      );
  const fallbackPromise = !inImageMode
    ? fallbackGeneratePickupLines(params.initialFormState)
    : fallbackAnalyzeChat(frames, params.initialFormState.crushDescription);

  try {
    // First, try to get results from the main function
    const result = await primaryPromise;
    if (Array.isArray(result) && result.length > 0) {
      return result;
    }
  } catch (error) {
    // If main function fails, we'll continue to the fallback
    console.log("Main function failed, trying fallback");
  }

  // If we're here, it means the main function didn't succeed, so we'll use the fallback
  const fallbackResult = await fallbackPromise;

  if (
    !fallbackResult ||
    !Array.isArray(fallbackResult) ||
    fallbackResult.length === 0
  ) {
    throw new Error("No pickup lines were generated");
  }

  return fallbackResult;
}

// Handle Generation Requests
export async function generateOutput(
  prevState: GenerateOutputState,
  formData: FormData,
): Promise<GenerateOutputState> {
  // validate the form data using the schema
  const validatedInputs = parseFormData(formData);

  // Return early if the form data is invalid
  if (!validatedInputs.success) {
    return {
      message: "error",
      errors: validatedInputs.error.flatten().fieldErrors,
    };
  }

  try {
    const listPickupLines = await generatePickupLinesWithFallback({
      initialFormState: validatedInputs.data,
    });
    return {
      message: "success",
      pickupLines: listPickupLines,
      InitialFormState: validatedInputs.data,
    };
  } catch (e) {
    console.error(e);
    return {
      message: "error",
      errors: e instanceof Error ? e.message : "Unknown error occurred",
    };
  }
}

// Handle Regeeration Requests
export async function regenerateOutput(
  prevState: GenerateOutputState,
  formData: FormData,
): Promise<GenerateOutputState> {
  try {
    if (!prevState.InitialFormState) {
      throw new Error("Initial form state is missing");
    }

    // Apply Rate Limiting
    const { success, reset, error } = await rateLimiter();

    if (!success) {
      return {
        message: "error",
        pickupLines: prevState.pickupLines,
        InitialFormState: prevState.InitialFormState,
        errors: `${error}. Try again at ${new Date(reset).toLocaleTimeString()}`,
      };
    }

    const listPickupLines = await generatePickupLinesWithFallback({
      initialFormState: prevState.InitialFormState,
    });

    return {
      message: "success",
      pickupLines: listPickupLines,
      InitialFormState: prevState.InitialFormState,
    };
  } catch (e) {
    console.error(e);
    return {
      message: "error",
      pickupLines: prevState.pickupLines, // Keep the previous pickup lines
      InitialFormState: prevState.InitialFormState,
      errors: e instanceof Error ? e.message : "Unknown error occurred",
    };
  }
}
