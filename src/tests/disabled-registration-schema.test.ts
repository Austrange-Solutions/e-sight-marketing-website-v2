import { disabledRegistrationSchema } from "@/lib/validations/disabled-registration";

async function run() {
  const payload = {
    fullName: "Test User",
    email: "Test.User@Example.com",
    phone: "9876543210",
    aadharNumber: "111122223333",
    dateOfBirth: "1990-01-01",
    gender: "Male",
    address: "123 Test Street, Sample Area",
    addressLine2: "",
    city: "TestCity",
    state: "TestState",
    pincode: "560001",
    disabilityType: "Visual Impairment",
    disabilityPercentage: 60,
    disabilityDescription: "This is a test disability description with sufficient length.",
    documents: {
      passportPhoto: { fileName: "photo.jpg", fileUrl: "https://example.com/photo.jpg", fileSize: 12345 },
      disabilityCertificate: { fileName: "cert.pdf", fileUrl: "https://example.com/cert.pdf", fileSize: 23456 },
      aadharCard: { fileName: "aadhar.jpg", fileUrl: "https://example.com/aadhar.jpg", fileSize: 12345 }
    }
  };

  try {
    const validated = disabledRegistrationSchema.parse(payload);
    console.log("Validation succeeded:", validated);
  } catch (err) {
    console.error("Validation failed:", err);
    process.exit(1);
  }
}

run();
