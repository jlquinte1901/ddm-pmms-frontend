import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required.'),
    password: z
      .string()
      .min(12, 'New password must be at least 12 characters.'),
    password_confirmation: z
      .string()
      .min(1, 'Confirm the new password.'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    message: 'The passwords do not match.',
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
