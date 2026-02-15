import { z } from 'zod';

export const emailSchema = z
  .string()
  .email({ message: 'Invalid email format' })
  .max(255, 'Email too long')
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long');

export const addressSchema = z
  .string()
  .min(1, 'Address is required')
  .max(500, 'Address too long');
