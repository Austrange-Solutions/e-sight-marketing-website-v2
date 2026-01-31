"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Upload, X, CheckCircle } from "lucide-react";

export default function CreateTicketForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    userType: "General",
    problemCategory: "General Inquiry",
    customProblem: "",
    description: "",
    photos: [] as string[],
  });

  // Validation states
  const [phoneError, setPhoneError] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const maxWords = 150;

  // Validate phone number (10 digits, starts with 6-9)
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 0) {
      setPhoneError("");
      return true;
    }
    if (cleaned.length !== 10) {
      setPhoneError("Must be exactly 10 digits");
      return false;
    }
    if (!/^[6-9]/.test(cleaned)) {
      setPhoneError("Must start with 6, 7, 8, or 9");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Count words in description
  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const problemCategories = [
    "General Inquiry",
    "Account Issue",
    "Payment Problem",
    "Product Defect",
    "Delivery Issue",
    "Website Bug",
    "Accessibility Issue",
    "Other",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    const uploadedUrls: string[] = [];
    for (const file of files) {
      try {
        // Get presigned URL
        const { data } = await axios.post("/api/support/upload-url", {
          filename: file.name,
          contentType: file.type,
        });

        // Upload to S3
        await axios.put(data.uploadUrl, file, {
          headers: { "Content-Type": file.type },
        });

        uploadedUrls.push(data.fileUrl);
      } catch (error) {
        console.error("Upload failed for file:", file.name, error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone before submission
    if (!validatePhone(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    // Validate word count
    if (wordCount > maxWords) {
      toast.error(
        `Description must not exceed ${maxWords} words (current: ${wordCount})`
      );
      return;
    }

    setLoading(true);

    try {
      let uploadedPhotoUrls: string[] = [];
      if (files.length > 0) {
        setUploading(true);
        uploadedPhotoUrls = await uploadFiles();
        setUploading(false);
      }

      const payload = {
        ...formData,
        photos: uploadedPhotoUrls,
      };

      const response = await axios.post("/api/support/create", payload);

      if (response.data.success) {
        setSuccess(true);
        setTicketId(response.data.ticketId);
        toast.success("Ticket created successfully!");
      }
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast.error(error.response?.data?.error || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ticket Created!
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Your support ticket has been successfully created. We have sent a
          confirmation email to <strong>{formData.email}</strong>.
        </p>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
          <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide font-semibold">
            Your Ticket ID
          </p>
          <p className="text-3xl font-mono font-bold text-blue-600 select-all">
            {ticketId}
          </p>
        </div>
        <p className="text-gray-500 mb-8">
          Please save this Ticket ID to track the status of your request.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Create Another Ticket
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Raise a Support Ticket
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Personal Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            inputMode="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
            <span className="text-xs text-gray-500 ml-2">(10 digits only)</span>
          </label>
          <input
            type="tel"
            inputMode="numeric"
            required
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            className={`w-full px-4 py-3 rounded-lg border ${
              phoneError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:ring-2 focus:border-transparent outline-none transition-all`}
            value={formData.phone}
            onChange={(e) => {
              // Only allow numbers
              const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
              setFormData({ ...formData, phone: cleaned });
              validatePhone(cleaned);
            }}
            placeholder="9876543210"
          />
          {phoneError && (
            <p className="text-red-500 text-sm mt-1">{phoneError}</p>
          )}
          {formData.phone && !phoneError && formData.phone.length === 10 && (
            <p className="text-green-600 text-sm mt-1">✓ Valid phone number</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a...
          </label>
          <select
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.userType}
            onChange={(e) =>
              setFormData({ ...formData, userType: e.target.value })
            }
          >
            <option value="Blind">Blind Person</option>
            <option value="Caretaker">Caretaker</option>
            <option value="General">General User</option>
            <option value="User">Registered User</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Problem Category
          </label>
          <select
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.problemCategory}
            onChange={(e) =>
              setFormData({ ...formData, problemCategory: e.target.value })
            }
          >
            {problemCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {formData.problemCategory === "Other" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specify Problem
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={formData.customProblem}
            onChange={(e) =>
              setFormData({ ...formData, customProblem: e.target.value })
            }
            placeholder="Please specify your issue"
          />
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Description
          <span
            className={`text-xs ml-2 ${
              wordCount > maxWords ? "text-red-500" : "text-gray-500"
            }`}
          >
            ({wordCount}/{maxWords} words)
          </span>
        </label>
        <textarea
          required
          rows={5}
          className={`w-full px-4 py-3 rounded-lg border ${
            wordCount > maxWords
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          } focus:ring-2 focus:border-transparent outline-none transition-all resize-none`}
          value={formData.description}
          onChange={(e) => {
            const newDescription = e.target.value;
            setFormData({ ...formData, description: newDescription });
            setWordCount(countWords(newDescription));
          }}
          placeholder="Please describe your issue in detail..."
        />
        {wordCount > maxWords && (
          <p className="text-red-500 text-sm mt-1">
            Description exceeds maximum of {maxWords} words. Please reduce by{" "}
            {wordCount - maxWords} words.
          </p>
        )}
      </div>

      {/* <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-blue-600 font-medium">Click to upload photos</span>
            <span className="text-gray-400 text-sm mt-1">JPG, PNG up to 5MB</span>
          </label>
        </div>
        
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-600 break-all">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X />
                </button>
              </div>
            ))}
          </div>
        )}
      </div> */}

      <button
        type="submit"
        disabled={loading || !!phoneError || wordCount > maxWords}
        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
          loading || phoneError || wordCount > maxWords
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600"
        }`}
      >
        {loading
          ? uploading
            ? "Uploading Files..."
            : "Submitting Ticket..."
          : "Submit Ticket"}
      </button>
    </form>
  );
}
