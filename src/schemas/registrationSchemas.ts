import { z } from 'zod';
import { differenceInYears, isValid, parseISO } from 'date-fns';

export const PERSONAL_INFO_ERROR_CODES = {
  REQUIRED: 'This field is required',
  CNIC_LENGTH: 'CNIC must be exactly 13 digits',
  CNIC_FORMAT: 'CNIC must contain only digits',
  DOB_INVALID: 'Enter a valid date of birth (YYYY-MM-DD)',
  DOB_TOO_YOUNG: 'You must be at least 13 years old',
} as const;

export const MINIMUM_CANDIDATE_AGE = 13;

export const cnicFieldSchema = z
  .string()
  .trim()
  .min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED)
  .length(13, PERSONAL_INFO_ERROR_CODES.CNIC_LENGTH)
  .regex(/^\d{13}$/, PERSONAL_INFO_ERROR_CODES.CNIC_FORMAT);

export const dobFieldSchema = z
  .string()
  .trim()
  .min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED)
  .refine((value) => isValid(parseISO(value)), PERSONAL_INFO_ERROR_CODES.DOB_INVALID)
  .refine(
    (value) =>
      !isValid(parseISO(value)) ||
      differenceInYears(new Date(), parseISO(value)) >= MINIMUM_CANDIDATE_AGE,
    PERSONAL_INFO_ERROR_CODES.DOB_TOO_YOUNG,
  );

export const personalInfoSchema = z.object({
  fatherName: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
  cnic: cnicFieldSchema,
  dob: dobFieldSchema,
  province: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
  district: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
  tehsil: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
  address: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
