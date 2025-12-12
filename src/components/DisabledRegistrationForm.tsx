'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {Upload, CheckCircle, Loader2, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";

// Simple toast replacement
const toast = {
  error: (message: string) => alert(`Error: ${message}`),
  success: (message: string) => alert(`Success: ${message}`),
  info: (message: string) => alert(`Info: ${message}`),
};

type DocumentType = {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt?: Date;
};

// Form validation schema with real-time validation - matches API schema
const formSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s.]+$/, "Only letters, spaces, and dots allowed"),
  email: z.string().email("Invalid email address").toLowerCase(),
  aadharNumber: z.string().regex(/^\d{12}$/, "Aadhaar must be a 12-digit number").optional().or(z.literal("")),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
  alternatePhone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit number").optional().or(z.literal("")),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 1 && age <= 120;
  }, "Age must be between 1 and 120 years"),
  gender: z.enum(["Male", "Female", "Other"], { message: "Please select a gender" }),
  address: z.string().min(10, "Address must be at least 10 characters").max(500, "Address must not exceed 500 characters"),
  city: z.string().min(2, "City name must be at least 2 characters").max(100, "City must not exceed 100 characters"),
  state: z.string().min(2, "Please select a state"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  disabilityType: z.enum([
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
    "Parkinsonâ€™s Disease",
    "Others"
  ], { message: "Please select a disability type" }),
  disabilityPercentage: z
    .number({ message: "Must be a number" })
    .min(40, "Must be at least 40%")
    .max(100, "Cannot exceed 100%"),
  disabilityDescription: z.string().min(20, "Please provide at least 20 characters").max(1000, "Must not exceed 1000 characters"),
  medicalConditions: z.string().max(1000, "Must not exceed 1000 characters").optional().or(z.literal("")),
  guardianName: z.string().min(3, "Guardian name must be at least 3 characters").max(100, "Must not exceed 100 characters").optional().or(z.literal("")),
  guardianEmail: z.string().email("Invalid guardian email").optional().or(z.literal("")),
  guardianRelation: z.string().max(50, "Must not exceed 50 characters").optional().or(z.literal("")),
  guardianPhone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit number").optional().or(z.literal("")),
  emergencyContactName: z.string().min(3, "Emergency contact must be at least 3 characters").max(100, "Must not exceed 100 characters").optional().or(z.literal("")),
  emergencyContactPhone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit number").optional().or(z.literal("")),
  emergencyContactRelation: z.string().max(50, "Must not exceed 50 characters").optional().or(z.literal("")),
  assistiveDevicesUsed: z.string().max(500, "Must not exceed 500 characters").optional().or(z.literal("")),
  employmentStatus: z.string().max(100, "Must not exceed 100 characters").optional().or(z.literal("")),
  monthlyIncome: z.string().max(50, "Must not exceed 50 characters").optional().or(z.literal("")),
  EducationLevel: z.string().max(100, "Must not exceed 100 characters").optional().or(z.literal("")),
  additionalNotes: z.string().max(1000, "Must not exceed 1000 characters").optional().or(z.literal("")),
  documents: z.object({
    passportPhoto: z.object({
      fileName: z.string(),
      fileUrl: z.string(),
      fileSize: z.number(),
      fileType: z.string().optional(),
      uploadedAt: z.date().optional(),
    }),
    aadharCard: z.object({
      fileName: z.string(),
      fileUrl: z.string(),
      fileSize: z.number(),
      fileType: z.string().optional(),
      uploadedAt: z.date().optional(),
    }).optional(),
    panCard: z.object({
      fileName: z.string(),
      fileUrl: z.string(),
      fileSize: z.number(),
      fileType: z.string().optional(),
      uploadedAt: z.date().optional(),
    }).optional(),
    disabilityCertificate: z.object({
      fileName: z.string(),
      fileUrl: z.string(),
      fileSize: z.number(),
      fileType: z.string().optional(),
      uploadedAt: z.date().optional(),
    }),
    udidCard: z.object({
      fileName: z.string(),
      fileUrl: z.string(),
      fileSize: z.number(),
      fileType: z.string().optional(),
      uploadedAt: z.date().optional(),
    }).optional(),
  }).refine(
    (docs) => docs.aadharCard || docs.panCard,
    {
      message: "At least one ID proof (Aadhar Card or PAN Card) is required",
      path: ["aadharCard"],
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

const DISABILITY_TYPES = [
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
  "Parkinsonâ€™s Disease",
  "Others"
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function DisabledRegistrationForm() {
  const router = useRouter();
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState<{ email: boolean; phone: boolean }>({
    email: false,
    phone: false,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      fullName: "",
      aadharNumber: "",
      email: "",
  guardianEmail: "",
      phone: "",
      alternatePhone: "",
      dateOfBirth: "",
      gender: "" as "Male" | "Female" | "Other",
      address: "",
      city: "",
      state: "",
      pincode: "",
      disabilityType: undefined as any,
      disabilityPercentage: 40,
      disabilityDescription: "",
      medicalConditions: "",
      guardianName: "",
      guardianRelation: "",
      guardianPhone: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      assistiveDevicesUsed: "",
      employmentStatus: "",
      monthlyIncome: "",
      EducationLevel: "",
      additionalNotes: "",
      documents: {},
    },
  });

  const watchEmail = watch("email");
  const watchPhone = watch("phone");
  const watchDisabilityType = watch("disabilityType");
  const documents = watch("documents");

  // Real-time duplicate check for email
  useEffect(() => {
    if (watchEmail && watchEmail.includes("@") && touchedFields.email) {
      setCheckingDuplicate((prev) => ({ ...prev, email: true }));
      
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/disabled-registration/check-duplicate?email=${encodeURIComponent(watchEmail)}`
          );
          const data = await response.json();
          
          if (data.exists) {
            setError("email", {
              type: "manual",
              message: "âš ï¸ This email is already registered",
            });
          } else {
            clearErrors("email");
          }
        } catch (error) {
          console.error("Duplicate check failed:", error);
        } finally {
          setCheckingDuplicate((prev) => ({ ...prev, email: false }));
        }
      }, 800); // Debounce for 800ms

      return () => clearTimeout(timeoutId);
    }
  }, [watchEmail, setError, clearErrors, touchedFields.email]);

  // Real-time duplicate check for phone
  useEffect(() => {
    if (watchPhone && watchPhone.length === 10 && touchedFields.phone) {
      setCheckingDuplicate((prev) => ({ ...prev, phone: true }));
      
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/disabled-registration/check-duplicate?phone=${watchPhone}`
          );
          const data = await response.json();
          
          if (data.exists) {
            setError("phone", {
              type: "manual",
              message: "âš ï¸ This phone number is already registered",
            });
          } else {
            clearErrors("phone");
          }
        } catch (error) {
          console.error("Duplicate check failed:", error);
        } finally {
          setCheckingDuplicate((prev) => ({ ...prev, phone: false }));
        }
      }, 800); // Debounce for 800ms

      return () => clearTimeout(timeoutId);
    }
  }, [watchPhone, setError, clearErrors, touchedFields.phone]);

  // Handle file upload with React Hook Form
  const handleFileUpload = async (
    documentType: "passportPhoto" | "aadharCard" | "panCard" | "disabilityCertificate" | "udidCard",
    file: File
  ) => {
    try {
      setUploadingDoc(documentType);

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only images (JPEG, PNG, WebP, GIF) and PDF files are allowed");
        return;
      }

      // Step 1: Get signed URL
      const signedUrlResponse = await fetch("/api/disabled-registration/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          documentType,
        }),
      });

      if (!signedUrlResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { signedUrl, viewUrl, filename } = await signedUrlResponse.json();

      // Step 2: Upload file to S3
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Step 3: Save document info using React Hook Form setValue
      const documentInfo: DocumentType = {
        fileUrl: viewUrl,
        fileName: filename,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date(),
      };

      // Update the specific document field in the form
      const currentDocuments = getValues("documents") || {};
      setValue(
        "documents",
        {
          ...currentDocuments,
          [documentType]: documentInfo,
        },
        { shouldValidate: true }
      );

      toast.success(`${documentType} uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploadingDoc(null);
    }
  };

  // Remove document with React Hook Form
  const handleRemoveDocument = (documentType: "passportPhoto" | "aadharCard" | "panCard" | "disabilityCertificate" | "udidCard") => {
    const currentDocuments = getValues("documents") || {};
    setValue(
      "documents",
      {
        ...currentDocuments,
        [documentType]: undefined,
      },
      { shouldValidate: true }
    );
    toast.info("Document removed");
  };

  // Handle form submission with React Hook Form
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      console.log("Submitting form data:", data);
      
      const response = await fetch("/api/disabled-registration/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Log validation details if available
        if (responseData.details) {
          console.error("Validation errors from API:", responseData.details);
          // Show all validation errors
          responseData.details.forEach((error: { field: string; message: string }) => {
            console.error(`Field: ${error.field} - ${error.message}`);
          });
          // Show first validation error to user
          const firstError = responseData.details[0];
          toast.error(`Validation Error - ${firstError.field}: ${firstError.message}`);
        } else {
          toast.error(responseData.error || "Registration failed");
        }
        throw new Error(responseData.error || "Registration failed");
      }

      toast.success("Registration submitted successfully!");
      
      // Redirect to status page after a short delay
      setTimeout(() => {
        router.push(`/disabled-registration/status?id=${responseData.registrationId}`);
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      if (!(error instanceof Error && error.message.includes("Validation failed"))) {
        toast.error(error instanceof Error ? error.message : "Registration failed");
      }
    }
  };

  // File upload component
  const FileUploadSection = ({
    label,
    documentType,
    required = false,
    description,
  }: {
    label: string;
    documentType: "passportPhoto" | "aadharCard" | "panCard" | "disabilityCertificate" | "udidCard";
    required?: boolean;
    description?: string;
  }) => {
    const documents = watch("documents");
    const document = documents?.[documentType];
    const isUploading = uploadingDoc === documentType;

    return (
      <div className="space-y-2">
        <Label htmlFor={documentType} className="text-base">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="flex items-center gap-3">
          <Input
            id={documentType}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(documentType, file);
            }}
            disabled={isUploading || isSubmitting}
            className="flex-1"
            aria-label={label}
            aria-required={required}
            suppressHydrationWarning
          />
          {isUploading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          {document && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" aria-label="Uploaded" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveDocument(documentType)}
                disabled={isSubmitting}
                aria-label={`Remove ${label}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        {document && !Array.isArray(document) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>{document.fileName} ({(document.fileSize / 1024).toFixed(0)} KB)</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" aria-label="Disabled Person Registration Form" suppressHydrationWarning>

      {/* Guardian Information (moved above Personal Information as requested) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Guardian Information <span className="text-sm text-muted-foreground">(If applicable)</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Full Name</Label>
              <Input id="guardianName" {...register("guardianName")} placeholder="Guardian full name" disabled={isSubmitting} suppressHydrationWarning />
              {errors.guardianName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.guardianName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianEmail">Guardian Email</Label>
              <Input id="guardianEmail" type="email" {...register("guardianEmail")} placeholder="guardian@example.com" disabled={isSubmitting} suppressHydrationWarning />
              {errors.guardianEmail && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.guardianEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <Input id="guardianPhone" type="tel" {...register("guardianPhone")} placeholder="10-digit mobile number" maxLength={10} disabled={isSubmitting} suppressHydrationWarning />
              {errors.guardianPhone && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.guardianPhone.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Enter your full name"
                aria-required="true"
                disabled={isSubmitting}
                suppressHydrationWarning
              />
              {errors.fullName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadharNumber">
                Aadhaar Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="aadharNumber"
                type="text"
                {...register("aadharNumber")}
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                aria-required="true"
                disabled={isSubmitting}
                suppressHydrationWarning
              />
              {errors.aadharNumber && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.aadharNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="your.email@example.com"
                  aria-required="true"
                  disabled={isSubmitting}
                  suppressHydrationWarning
                />
                {checkingDuplicate.email && (
                  <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  aria-required="true"
                  disabled={isSubmitting}
                  suppressHydrationWarning
                />
                {checkingDuplicate.phone && (
                  <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                max={new Date().toISOString().split('T')[0]}
                aria-required="true"
                disabled={isSubmitting}
                suppressHydrationWarning
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="gender"
                    disabled={isSubmitting}
                    aria-required="true"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    suppressHydrationWarning
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              />
              {errors.gender && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">
                Address Line 1 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="House/Flat No., Street Name"
                rows={2}
                aria-required="true"
                disabled={isSubmitting}
                suppressHydrationWarning
              />
              {errors.address && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.address.message}
                </p>
              )}
            </div>          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="City name"
                aria-required="true"
                disabled={isSubmitting}
                suppressHydrationWarning
              />
              {errors.city && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">
                State <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="state"
                    disabled={isSubmitting}
                    aria-required="true"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    suppressHydrationWarning
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.state && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.state.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">
                Pincode <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pincode"
                {...register("pincode")}
                placeholder="6-digit pincode"
                maxLength={6}
                aria-required="true"
                disabled={isSubmitting}
                suppressHydrationWarning
              />
              {errors.pincode && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.pincode.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disability Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Disability Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="disabilityType">
                Type of Disability <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="disabilityType"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="disabilityType"
                    disabled={isSubmitting}
                    aria-required="true"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    suppressHydrationWarning
                  >
                    <option value="">Select disability type</option>
                    {DISABILITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.disabilityType && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.disabilityType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="disabilityPercentage">
                Disability Percentage (40%-100%) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="disabilityPercentage"
                type="number"
                min="40"
                max="100"
                {...register("disabilityPercentage", { valueAsNumber: true })}
                placeholder="e.g., 75"
                aria-required="true"
                disabled={isSubmitting}
                suppressHydrationWarning
              />
              {errors.disabilityPercentage && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.disabilityPercentage.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disabilityDescription">
              Describe Your Disability <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="disabilityDescription"
              {...register("disabilityDescription")}
              placeholder="Please provide detailed information about your disability (minimum 20 characters)"
              rows={4}
              disabled={isSubmitting}
              aria-required="true"
              suppressHydrationWarning
            />
            {errors.disabilityDescription && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.disabilityDescription.message}
              </p>
            )}
          </div>

          {watchDisabilityType === "Others" && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Please provide comprehensive details about your specific disability in the description above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Document Upload</CardTitle>
          <p className="text-sm text-muted-foreground">
            All documents must be clear and legible. Accepted formats: JPEG, PNG, WebP, GIF, PDF (Max 10MB each)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUploadSection
            label="Passport Size Photo"
            documentType="passportPhoto"
            required
            description="Recent passport size photograph (white background preferred)"
          />

          <FileUploadSection
            label="Aadhar Card"
            documentType="aadharCard"
            required
            description="Upload your Aadhar Card (front and back)"
          />

          <FileUploadSection
            label="PAN Card"
            documentType="panCard"
            description="Upload your PAN Card (if Aadhar not available)"
          />

          <FileUploadSection
            label="Disability Certificate"
            documentType="disabilityCertificate"
            required
            description="Government-issued disability certificate"
          />

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> At least one ID proof (Aadhar or PAN Card) is mandatory for verification.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-12"
          aria-label="Submit registration form"
          suppressHydrationWarning
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Submit Registration
            </>
          )}
        </Button>

        {isSubmitting && (
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            Please wait while we process your registration...
          </p>
        )}
      </div>
    </form>
  );
}
