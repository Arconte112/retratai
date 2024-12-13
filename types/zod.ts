import { z } from "zod";

const tuneType = process.env.NEXT_PUBLIC_TUNE_TYPE;

export const fileUploadFormSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z ]+$/, "Only letters and spaces are allowed"),
  type: tuneType === 'replicate' 
    ? z.enum(['man', 'woman'], {
        required_error: "You must select a type",
        invalid_type_error: "Type must be either 'man' or 'woman'",
      })
    : z.string().min(1).max(50),
});