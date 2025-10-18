import { z } from "zod";

// Document type schema
export const documentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Invalid file URL"),
  fileSize: z.number().positive("File size must be positive"),
  uploadedAt: z.date().optional(),
});

// Main disabled registration schema
export const disabledRegistrationSchema = z.object({
  // Personal Information
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s.]+$/, "Full name can only contain letters, spaces, and dots"),

  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Phone number must be a valid 10-digit Indian mobile number"),

  alternatePhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Alternate phone must be a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),

  dateOfBirth: z
    .string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 1 && age <= 120;
    }, "Age must be between 1 and 120 years"),

  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a valid gender",
  }),

  // Address Information
  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must not exceed 500 characters"),

  city: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name must not exceed 100 characters"),

  state: z
    .string()
    .min(2, "Please select a valid state"),

  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be a valid 6-digit number"),

  // Disability Information
  disabilityType: z.enum(
    [
      "Visual Impairment",
      "Hearing Impairment",
      "Locomotor Disability",
      "Intellectual Disability",
      "Mental Illness",
      "Multiple Disabilities",
      "Other",
    ],
    {
      message: "Please select a valid disability type",
    }
  ),

  disabilityPercentage: z
    .number({
      message: "Disability percentage must be a number",
    })
    .min(40, "Disability percentage must be at least 40% for registration")
    .max(100, "Disability percentage cannot exceed 100%"),

  disabilityDescription: z
    .string()
    .min(20, "Disability description must be at least 20 characters")
    .max(1000, "Disability description must not exceed 1000 characters"),

  medicalConditions: z
    .string()
    .max(1000, "Medical conditions must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),

  // Guardian Information (Optional for adults)
  guardianName: z
    .string()
    .min(3, "Guardian name must be at least 3 characters")
    .max(100, "Guardian name must not exceed 100 characters")
    .optional()
    .or(z.literal("")),

  guardianRelation: z
    .string()
    .max(50, "Guardian relation must not exceed 50 characters")
    .optional()
    .or(z.literal("")),

  guardianPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Guardian phone must be a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),

  // Documents
  documents: z.object({
    passportPhoto: documentSchema,
    aadharCard: documentSchema.optional(),
    panCard: documentSchema.optional(),
    disabilityCertificate: documentSchema,
    udidCard: documentSchema.optional(),
    additionalDocuments: z.array(documentSchema).optional(),
  }).refine(
    (docs) => docs.aadharCard || docs.panCard,
    {
      message: "At least one ID proof (Aadhar Card or PAN Card) is required",
      path: ["aadharCard"],
    }
  ),

  // Emergency Contact
  emergencyContactName: z
    .string()
    .min(3, "Emergency contact name must be at least 3 characters")
    .max(100, "Emergency contact name must not exceed 100 characters")
    .optional()
    .or(z.literal("")),

  emergencyContactPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Emergency contact phone must be a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),

  emergencyContactRelation: z
    .string()
    .max(50, "Emergency contact relation must not exceed 50 characters")
    .optional()
    .or(z.literal("")),

  // Additional Information
  assistiveDevicesUsed: z
    .string()
    .max(500, "Assistive devices must not exceed 500 characters")
    .optional()
    .or(z.literal("")),

  employmentStatus: z
    .string()
    .max(100, "Employment status must not exceed 100 characters")
    .optional()
    .or(z.literal("")),

  monthlyIncome: z
    .string()
    .max(50, "Monthly income must not exceed 50 characters")
    .optional()
    .or(z.literal("")),

  EducationLevel: z
    .string()
    .max(100, "Education level must not exceed 100 characters")
    .optional()
    .or(z.literal("")),

  additionalNotes: z
    .string()
    .max(1000, "Additional notes must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

// Type inference for TypeScript
export type DisabledRegistrationFormData = z.infer<typeof disabledRegistrationSchema>;

// Partial schema for status check (only needs email or ID)
export const statusCheckSchema = z.object({
  search: z
    .string()
    .min(3, "Please enter at least 3 characters")
    .max(100, "Search term too long"),
  searchType: z.enum(["email", "registrationId"], {
    message: "Invalid search type",
  }),
});

export type StatusCheckFormData = z.infer<typeof statusCheckSchema>;
