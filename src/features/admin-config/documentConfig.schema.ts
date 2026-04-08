import { z } from "zod";

export const fieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Field name is required"),
  type: z.enum(["text", "number", "date", "currency"]),
  required: z.boolean(),
});

export const documentConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Document type name is required"),
  fields: z
    .array(fieldSchema)
    .min(1, "At least one field is required")
    .refine(
      (fields) => {
        const names = fields.map((f) => f.name.trim().toLowerCase());
        return new Set(names).size === names.length;
      },
      {
        message: "Field names must be unique",
        path: ["fields"],
      }
    ),
  is_approved: z.boolean().optional(),
});

export type DocumentConfigFormValues = z.infer<
  typeof documentConfigSchema
>;
