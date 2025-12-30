import React, { useState } from "react";

type Props = {
  onSuccess: (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
  }) => void;
};

const UserPersonalCredentialForm: React.FC<Props> = ({ onSuccess }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressWordCount, setAddressWordCount] = useState(0);
  const maxWords = 150;

  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
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

  // Count words
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phoneNumber || !address) {
      setError("Please fill all fields.");
      return;
    }
    if (!validatePhone(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }
    if (addressWordCount > maxWords) {
      setError(`Address must not exceed ${maxWords} words`);
      return;
    }
    setError("");
    onSuccess({ fullName, email, phoneNumber, address });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Shipping Details</h2>
      <input
        className="w-full border rounded px-3 py-2"
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
      />
      <input
        className="w-full border rounded px-3 py-2"
        type="email"
        inputMode="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className={`w-full border rounded px-3 py-2 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
        type="tel"
        inputMode="numeric"
        pattern="[6-9][0-9]{9}"
        placeholder="Phone Number (10 digits)"
        maxLength={10}
        value={phoneNumber}
        onChange={e => {
          const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
          setPhoneNumber(cleaned);
          validatePhone(cleaned);
        }}
      />
      {phoneError && <div className="text-red-600 text-sm">{phoneError}</div>}
      {phoneNumber.length === 10 && !phoneError && (
        <div className="text-green-600 text-sm">✓ Valid phone number</div>
      )}
      <textarea
        className={`w-full border rounded px-3 py-2 ${addressWordCount > maxWords ? 'border-red-500' : 'border-gray-300'}`}
        placeholder="Address"
        value={address}
        onChange={e => {
          const newAddress = e.target.value;
          setAddress(newAddress);
          setAddressWordCount(countWords(newAddress));
        }}
      />
      <div className={`text-sm ${addressWordCount > maxWords ? 'text-red-600' : 'text-gray-500'}`}>
        {addressWordCount}/{maxWords} words
      </div>
      {addressWordCount > maxWords && (
        <div className="text-red-600 text-sm">
          Address exceeds {maxWords} words limit
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      <button
        type="submit"
        className="w-full bg-primary text-white py-2 rounded font-bold"
      >
        Continue to Payment
      </button>
    </form>
  );
};

export default UserPersonalCredentialForm;
