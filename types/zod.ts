import { z } from "zod";

export const fileUploadFormSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z ]+$/, "Only letters and spaces are allowed"),
  gender: z.enum(["man", "woman"], {
    required_error: "Debes seleccionar el género",
  }),
});