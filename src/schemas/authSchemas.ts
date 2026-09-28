import { z } from 'zod';

const phoneRegex = /^(\+92|92|0)?3\d{9}$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(phoneRegex, 'Enter a valid Pakistani mobile number (e.g. 03001234567)');

export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const otpSchema = z
  .string()
  .length(6, 'Enter the 6-digit code')
  .regex(/^\d{6}$/, 'Code must contain only digits');

export const candidateLoginSchema = z.object({
  phoneNumber: phoneSchema,
  password: z.string().min(1, 'Password is required'),
});

export const candidateSignupSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: emailSchema,
    phoneNumber: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const candidateVerifySchema = z.object({
  phoneNumber: phoneSchema,
  otp: otpSchema,
});

export type CandidateLoginInput = z.infer<typeof candidateLoginSchema>;
export type CandidateSignupInput = z.infer<typeof candidateSignupSchema>;
export type CandidateVerifyInput = z.infer<typeof candidateVerifySchema>;
