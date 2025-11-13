# Validation Schemas

This directory contains all Zod validation schemas organized by domain.

## Structure

- **auth.ts** - Authentication-related schemas (login, register)
- **profile.ts** - User profile schemas (patient, doctor, emergency contacts)
- **medical.ts** - Medical data schemas (allergies, medications, records, appointments)
- **index.ts** - Centralized exports for easy importing

## Usage

Import schemas from the index file for convenience:

```typescript
import { 
  loginSchema, 
  profileSchema, 
  allergySchema 
} from "@/lib/validations";
```

Or import directly from specific files:

```typescript
import { loginSchema } from "@/lib/validations/auth";
import { profileSchema } from "@/lib/validations/profile";
import { allergySchema } from "@/lib/validations/medical";
```

## Schema Categories

### Authentication (auth.ts)
- `registerSchema` - User registration validation
- `loginSchema` - User login validation

### Profile (profile.ts)
- `profileSchema` - Basic user profile
- `doctorProfileSchema` - Doctor-specific profile fields
- `emergencyContactSchema` - Emergency contact information
- `cedulaValidationSchema` - Venezuelan ID validation
- `profileUpdateSchema` - Partial profile updates

### Medical (medical.ts)
- `allergySchema` - Patient allergies
- `medicationSchema` - Current medications
- `medicalHistorySchema` - Medical history and chronic conditions
- `vitalSignsSchema` - Vital signs measurements
- `diagnosisSchema` - Medical diagnoses
- `medicalRecordSchema` - Complete medical records
- `laboratoryResultSchema` - Lab test results
- `appointmentSchema` - Medical appointments

## Type Exports

Each schema exports corresponding TypeScript types:

```typescript
import type { 
  LoginFormData, 
  ProfileFormData, 
  AllergyFormData 
} from "@/lib/validations";
```

## Validation Rules

All schemas follow these principles:
- Spanish error messages for user-facing validation
- Appropriate min/max constraints
- Regex patterns for Venezuelan formats (phone, cedula)
- Optional fields marked explicitly
- Enum types for predefined options
