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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phoneNumber || !address) {
      setError("Please fill all fields.");
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
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="w-full border rounded px-3 py-2"
        type="tel"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={e => setPhoneNumber(e.target.value)}
      />
      <textarea
        className="w-full border rounded px-3 py-2"
        placeholder="Address"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />
      {error && <div className="text-red-600">{error}</div>}
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded font-bold"
      >
        Continue to Payment
      </button>
    </form>
  );
};

export default UserPersonalCredentialForm;