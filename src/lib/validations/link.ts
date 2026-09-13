import * as z from 'zod'

export const LinkSchema = z.object({
  url: z
    .string()
    .url({ message: 'Please enter a valid URL (including https://)' }),
  domain: z
    .string()
    .min(1, { message: 'Domain / slug is required' })
    .regex(/^[a-zA-Z0-9-_]+$/, {
      message:
        'Slug can only contain letters, numbers, hyphens, and underscores',
    }),
  description: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  maxClicks: z
    .union([
      z.number().int().positive(),
      z
        .string()
        .transform((val) =>
          val === '' || val === null || val === undefined ? null : Number(val)
        ),
      z.null(),
    ])
    .optional(),
  isActive: z.boolean().default(true).optional(),
  password: z.string().optional().nullable(),
})

export const linkPatchSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL' }).optional(),
  description: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  maxClicks: z
    .union([
      z.number().int().positive(),
      z
        .string()
        .transform((val) =>
          val === '' || val === null || val === undefined ? null : Number(val)
        ),
      z.null(),
    ])
    .optional(),
  isActive: z.boolean().optional(),
  password: z.string().optional().nullable(),
  clearPassword: z.boolean().optional(),
})

export const unlockSchema = z.object({
  password: z.string().min(1, { message: 'Password is required' }),
})

export type LinkForm = z.infer<typeof LinkSchema>
export type LinkPatchForm = z.infer<typeof linkPatchSchema>
export type UnlockForm = z.infer<typeof unlockSchema>
