import { z } from "zod";

// Document type schema
export const documentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Invalid file URL"),
  fileSize: z.number().positive("File size must be positive"),
  fileType: z.string().optional(), // Added for frontend compatibility
  uploadedAt: z.coerce.date().optional(), // Coerce string to date
});

// Main disabled registration schema
export const disabledRegistrationSchema = z.object({
  // Personal Information
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must not exceed 100 characters")
    .regex(
      /^[a-zA-Z\s.]+$/,
      "Full name can only contain letters, spaces, and dots"
    ),

  email: z.string().email("Invalid email address").toLowerCase(),

  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Phone number must be a valid 10-digit Indian mobile number"
    ),

  // Aadhaar number (optional if PAN provided)
  aadharNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be a 12-digit number")
    .optional()
    .or(z.literal("")),

  dateOfBirth: z.string().refine((date) => {
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
  addressLine2: z
    .string()
    .max(200, "Address line 2 must not exceed 200 characters")
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name must not exceed 100 characters"),

  state: z.string().min(2, "Please select a valid state"),

  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be a valid 6-digit number"),

  // Disability Information
  disabilityType: z
    .string()
    .min(1, "Please select a disability type")
    .refine(
      (value) =>
        [
          "Blindness",
          "Low Vision",
          "Leprosy Cured Persons",
          "Hearing Impairment (Deaf and hard of hearing)",
          "Locomotor Disability",
          "Dwarfism",
          "Intellectual Disability",
          "Mental Illness",
          "Autism Spectrum Disorder",
          "Cerebral Palsy",
          "Muscular Dystrophy",
          "Chronic Neurological Conditions",
          "Specific Learning Disabilities (e.g., Dyslexia)",
          "Multiple Sclerosis",
          "Speech and Language Disability",
          "Thalassemia",
          "Hemophilia",
          "Sickle Cell Disease",
          "Multiple Disabilities (More than one of the above)",
          "Acid Attack Victims",
          "Parkinson's Disease",
          "Others",
        ].includes(value),
      "Please select a valid disability type"
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

  // Guardian Information (Optional for adults)
  guardianName: z
    .string()
    .min(3, "Guardian name must be at least 3 characters")
    .max(100, "Guardian name must not exceed 100 characters")
    .optional()
    .or(z.literal("")),

  guardianEmail: z
    .string()
    .email("Guardian email must be a valid email address")
    .optional()
    .or(z.literal("")),

  guardianPhone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Guardian phone must be a valid 10-digit Indian mobile number"
    )
    .optional()
    .or(z.literal("")),

  // Documents - Made optional since upload functionality is currently disabled
  documents: z
    .object({
      passportPhoto: documentSchema.optional(),
      aadharCard: documentSchema.optional(),
      panCard: documentSchema.optional(),
      disabilityCertificate: documentSchema.optional(),
      udidCard: documentSchema.optional(),
      additionalDocuments: z.array(documentSchema).optional(),
    })
    .optional(),
});

// Type inference for TypeScript
export type DisabledRegistrationFormData = z.infer<
  typeof disabledRegistrationSchema
>;

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
