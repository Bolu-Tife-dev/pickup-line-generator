import { z } from "zod";

// Zod validation schema for form data
export const FormSchema = z
  .object({
    // JSON string of data-URL frames extracted client-side from a chat
    // screenshot / screen recording (image mode)
    chatFrames: z.string().max(3_000_000).optional(),
    // Optional free-text note (author's intent / extra context)
    crushDescription: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      (!!data.chatFrames && data.chatFrames.length > 2) ||
      (!!data.crushDescription && data.crushDescription.length > 0),
    {
      message:
        "Upload a chat screenshot (or screen recording), or add a note about your crush",
    },
  );

export type FormSchemaType = z.infer<typeof FormSchema>;

// Zod validation schema for Structured Output from Mixtral (LLM)
export const OutputSchema = z.object({
  pickupLines: z
    .array(
      z.object({
        id: z.number(),
        text: z.string().describe("The requested pickup line"),
      }),
    )
    .length(2)
    .describe("Pickup lines"),
});

export type OutputSchemaType = z.infer<typeof OutputSchema>;

export const FallbackOutputSchema = z.object({
  pickupLines: z.array(z.string()).length(2),
});

export type FallbackOutputSchemaType = z.infer<typeof FallbackOutputSchema>;
