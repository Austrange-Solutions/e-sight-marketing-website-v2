"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Download, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeUrl } from "@/lib/validation";

interface DocumentType {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

interface DisabledPersonDetail {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  disabilityType: string;
  disabilityPercentage: number;
  disabilityDescription: string;
  medicalConditions?: string;
  guardianName: string;
  guardianEmail?: string;
  guardianRelation?: string;
  guardianPhone: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  assistiveDevicesUsed?: string;
  employmentStatus?: string;
  monthlyIncome?: string;
  EducationLevel?: string;
  additionalNotes?: string;
  documents: {
    passportPhoto?: DocumentType;
    aadharCard?: DocumentType;
    panCard?: DocumentType;
    disabilityCertificate?: DocumentType;
    udidCard?: DocumentType;
    additionalDocuments?: DocumentType[];
  };
  verificationStatus: "pending" | "under_review" | "verified" | "rejected";
  verificationHistory: Array<{
    status: string;
    updatedBy: string;
    updatedAt: string;
    comments?: string;
  }>;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DisabledPersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [person, setPerson] = useState<DisabledPersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminComments, setAdminComments] = useState("");
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingDisability, setEditingDisability] = useState(false);

  // Editable form state
  const [personalForm, setPersonalForm] = useState<any>({});
  const [guardianForm, setGuardianForm] = useState<any>({});
  const [addressForm, setAddressForm] = useState<any>({});
  const [disabilityForm, setDisabilityForm] = useState<any>({});
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      fetchPersonDetails();
    }
  }, [resolvedParams]);

  const fetchPersonDetails = async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/disabled-persons/${resolvedParams.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch details");
      }

      setPerson(data.person);
      // initialize edit forms
      setPersonalForm({
        fullName: data.person.fullName,
        email: data.person.email,
        phone: data.person.phone,
        dateOfBirth: data.person.dateOfBirth,
        gender: data.person.gender,
      });
      setGuardianForm({
        guardianName: data.person.guardianName || "",
        guardianEmail: data.person.guardianEmail || "",
        guardianPhone: data.person.guardianPhone || "",
      });
      setAddressForm({
        address: data.person.address,
        addressLine2: data.person.addressLine2 || "",
        city: data.person.city,
        state: data.person.state,
        pincode: data.person.pincode,
      });
      setDisabilityForm({
        disabilityType: data.person.disabilityType,
        disabilityPercentage: data.person.disabilityPercentage,
        disabilityDescription: data.person.disabilityDescription,
      });
      setNewStatus(data.person.verificationStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load person details");
    } finally {
      setLoading(false);
    }
  };

  const saveEdits = async (group: "personal" | "guardian" | "address" | "disability") => {
    if (!resolvedParams) return;
    setUpdating(true);
    try {
      const body: any = {};
      if (group === "personal") body.personalUpdates = personalForm;
      if (group === "guardian") body.guardianUpdates = guardianForm;
      if (group === "address") body.addressUpdates = addressForm;
      if (group === "disability") body.disabilityUpdates = disabilityForm;

      const response = await fetch(`/api/admin/disabled-persons/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save edits");

      alert("Saved successfully");
      // refresh
      await fetchPersonDetails();
      setEditingPersonal(false);
      setEditingGuardian(false);
      setEditingAddress(false);
      setEditingDisability(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save edits");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !resolvedParams) return;

    if (!adminComments.trim() && newStatus !== person.verificationStatus) {
      alert("Please provide comments for the status update");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(`/api/admin/disabled-persons/${resolvedParams.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationStatus: newStatus,
          adminNotes: adminComments, // Changed from 'comments' to 'adminNotes'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      alert("Status updated successfully! Email notification has been sent.");
      setAdminComments("");
      await fetchPersonDetails();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "under_review":
        return "Under Review";
      case "verified":
        return "Verified";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const renderDocument = (label: string, doc?: DocumentType) => {
    if (!doc) return null;

    const isImage = doc.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isImage ? (
              <ImageIcon size={20} className="text-blue-500" />
            ) : (
              <FileText size={20} className="text-red-500" />
            )}
            <div>
              <p className="font-medium text-sm text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">{doc.fileName}</p>
              <p className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</p>
            </div>
          </div>
          <a
            href={sanitizeUrl(doc.fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-500"
            onClick={(e) => {
              if (sanitizeUrl(doc.fileUrl) === '#') {
                e.preventDefault();
              }
            }}
          >
            <Download size={18} />
          </a>
        </div>
        {isImage && (
          <a 
            href={sanitizeUrl(doc.fileUrl)} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => {
              if (sanitizeUrl(doc.fileUrl) === '#') {
                e.preventDefault();
              }
            }}
          >
            <div className="relative w-full h-32">
              <Image
                src={doc.fileUrl}
                alt={label}
                fill
                className="object-cover rounded border cursor-pointer hover:opacity-80"
              />
            </div>
          </a>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-accent p-8">
        <div className="max-w-7xl mx-auto">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || "Person not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Back to List
          </Button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{person.fullName}</h1>
              <p className="text-sm text-gray-500">Registration ID: {person._id}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                person.verificationStatus
              )}`}
            >
              {getStatusLabel(person.verificationStatus)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                {!editingPersonal ? (
                  <div className="flex justify-between items-start">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.fullName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Aadhaar Number</dt>
                        <dd className="text-sm text-gray-900 mt-1">{(person as any).aadharNumber || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.phone}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {new Date(person.dateOfBirth).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Gender</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.gender}</dd>
                      </div>
                    </dl>
                    <div className="ml-4">
                      <Button variant="outline" onClick={() => setEditingPersonal(true)}>Edit</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <input className="input" value={personalForm.fullName || ''} onChange={(e) => setPersonalForm({...personalForm, fullName: e.target.value})} />
                      </div>
                      <div>
                        <Label>Aadhaar Number</Label>
                        <input className="input" value={(personalForm as any).aadharNumber || ''} onChange={(e) => setPersonalForm({...personalForm, aadharNumber: e.target.value})} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <input className="input" value={personalForm.email || ''} onChange={(e) => setPersonalForm({...personalForm, email: e.target.value})} />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <input className="input" value={personalForm.phone || ''} onChange={(e) => setPersonalForm({...personalForm, phone: e.target.value})} />
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <input className="input" type="date" value={new Date(personalForm.dateOfBirth || '').toISOString().split('T')[0]} onChange={(e) => setPersonalForm({...personalForm, dateOfBirth: e.target.value})} />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <select className="input" value={personalForm.gender || ''} onChange={(e) => setPersonalForm({...personalForm, gender: e.target.value})}>
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveEdits('personal')} disabled={updating}>{updating ? 'Saving...' : 'Save'}</Button>
                      <Button variant="ghost" onClick={() => setEditingPersonal(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent>
                {!editingAddress ? (
                  <div className="flex justify-between items-start">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.address}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">City</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.city}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">State</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.state}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Pincode</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.pincode}</dd>
                      </div>
                    </dl>
                    <div className="ml-4">
                      <Button variant="outline" onClick={() => setEditingAddress(true)}>Edit</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label>Address</Label>
                        <input className="input" value={addressForm.address || ''} onChange={(e) => setAddressForm({...addressForm, address: e.target.value})} />
                      </div>
                      <div>
                        <Label>City</Label>
                        <input className="input" value={addressForm.city || ''} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                      </div>
                      <div>
                        <Label>State</Label>
                        <input className="input" value={addressForm.state || ''} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} />
                      </div>
                      <div>
                        <Label>Pincode</Label>
                        <input className="input" value={addressForm.pincode || ''} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveEdits('address')} disabled={updating}>{updating ? 'Saving...' : 'Save'}</Button>
                      <Button variant="ghost" onClick={() => setEditingAddress(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Disability Information */}
            <Card>
              <CardHeader>
                <CardTitle>Disability Information</CardTitle>
              </CardHeader>
              <CardContent>
                {!editingDisability ? (
                  <div className="flex justify-between items-start">
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Disability Type</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.disabilityType}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Disability Percentage</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.disabilityPercentage}%</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                          {person.disabilityDescription}
                        </dd>
                      </div>
                    </dl>
                    <div className="ml-4">
                      <Button variant="outline" onClick={() => setEditingDisability(true)}>Edit</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Disability Type</Label>
                        <input className="input" value={disabilityForm.disabilityType || ''} onChange={(e) => setDisabilityForm({...disabilityForm, disabilityType: e.target.value})} />
                      </div>
                      <div>
                        <Label>Disability Percentage</Label>
                        <input className="input" type="number" value={disabilityForm.disabilityPercentage || 0} onChange={(e) => setDisabilityForm({...disabilityForm, disabilityPercentage: Number(e.target.value)})} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Description</Label>
                        <textarea className="input" value={disabilityForm.disabilityDescription || ''} onChange={(e) => setDisabilityForm({...disabilityForm, disabilityDescription: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveEdits('disability')} disabled={updating}>{updating ? 'Saving...' : 'Save'}</Button>
                      <Button variant="ghost" onClick={() => setEditingDisability(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guardian Information */}
            <Card>
              <CardHeader>
                <CardTitle>Guardian & Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                {!editingGuardian ? (
                  <div className="flex justify-between items-start">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {person.guardianName && (
                        <>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Guardian Name</dt>
                            <dd className="text-sm text-gray-900 mt-1">{person.guardianName}</dd>
                          </div>
                          {person.guardianEmail && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Guardian Email</dt>
                              <dd className="text-sm text-gray-900 mt-1">{person.guardianEmail}</dd>
                            </div>
                          )}
                          {person.guardianPhone && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Guardian Phone</dt>
                              <dd className="text-sm text-gray-900 mt-1">{person.guardianPhone}</dd>
                            </div>
                          )}
                        </>
                      )}
                      {person.emergencyContactName && (
                        <>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                            <dd className="text-sm text-gray-900 mt-1">
                              {person.emergencyContactName}
                            </dd>
                          </div>
                          {person.emergencyContactPhone && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                              <dd className="text-sm text-gray-900 mt-1">
                                {person.emergencyContactPhone}
                              </dd>
                            </div>
                          )}
                          {person.emergencyContactRelation && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Relation</dt>
                              <dd className="text-sm text-gray-900 mt-1">
                                {person.emergencyContactRelation}
                              </dd>
                            </div>
                          )}
                        </>
                      )}
                      {!person.guardianName && !person.emergencyContactName && (
                        <div className="sm:col-span-2 text-sm text-gray-500">No guardian or emergency contact provided.</div>
                      )}
                    </dl>
                    <div className="ml-4">
                      <Button variant="outline" onClick={() => setEditingGuardian(true)}>Edit</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Guardian Name</Label>
                        <input className="input" value={guardianForm.guardianName || ''} onChange={(e) => setGuardianForm({...guardianForm, guardianName: e.target.value})} />
                      </div>
                      <div>
                        <Label>Guardian Email</Label>
                        <input className="input" value={guardianForm.guardianEmail || ''} onChange={(e) => setGuardianForm({...guardianForm, guardianEmail: e.target.value})} />
                      </div>
                      <div>
                        <Label>Guardian Phone</Label>
                        <input className="input" value={guardianForm.guardianPhone || ''} onChange={(e) => setGuardianForm({...guardianForm, guardianPhone: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveEdits('guardian')} disabled={updating}>{updating ? 'Saving...' : 'Save'}</Button>
                      <Button variant="ghost" onClick={() => setEditingGuardian(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(person.employmentStatus ||
              person.monthlyIncome ||
              person.EducationLevel ||
              person.additionalNotes) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    {person.employmentStatus && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Employment Status</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.employmentStatus}</dd>
                      </div>
                    )}
                    {person.monthlyIncome && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Monthly Income</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.monthlyIncome}</dd>
                      </div>
                    )}
                    {person.EducationLevel && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Education Level</dt>
                        <dd className="text-sm text-gray-900 mt-1">{person.EducationLevel}</dd>
                      </div>
                    )}
                    {person.additionalNotes && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Additional Notes</dt>
                        <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                          {person.additionalNotes}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>Click on documents to view or download</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderDocument("Passport Photo", person.documents.passportPhoto)}
                  {renderDocument("Aadhar Card", person.documents.aadharCard)}
                  {renderDocument("PAN Card", person.documents.panCard)}
                  {renderDocument("Disability Certificate", person.documents.disabilityCertificate)}
                  {renderDocument("UDID Card", person.documents.udidCard)}
                  {person.documents.additionalDocuments?.map((doc, index) => (
                    <div key={index}>{renderDocument(`Additional Document ${index + 1}`, doc)}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Status Update Form */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>Change verification status and add comments</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Verification Status</Label>
                    <select
                      id="status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Admin Comments *</Label>
                    <Textarea
                      id="comments"
                      value={adminComments}
                      onChange={(e) => setAdminComments(e.target.value)}
                      placeholder="Add comments about this status update..."
                      rows={4}
                      required={newStatus !== person.verificationStatus}
                    />
                    <p className="text-xs text-gray-500">
                      This will be included in the email notification sent to the applicant
                    </p>
                  </div>

                  <Button type="submit" disabled={updating} className="w-full">
                    {updating ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Updating...
                      </>
                    ) : (
                      "Update Status"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {person.verificationHistory.map((history, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-indigo-500 pl-3 py-2 bg-gray-50 rounded-r"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            history.status
                          )}`}
                        >
                          {getStatusLabel(history.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(history.updatedAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">By: {history.updatedBy}</p>
                      {history.comments && (
                        <p className="text-xs text-gray-700 mt-1 italic">{history.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Submitted</dt>
                    <dd className="text-gray-900">
                      {new Date(person.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Last Updated</dt>
                    <dd className="text-gray-900">
                      {new Date(person.updatedAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </dd>
                  </div>
                  {person.verifiedAt && (
                    <div>
                      <dt className="text-gray-500">Verified On</dt>
                      <dd className="text-gray-900">
                        {new Date(person.verifiedAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
