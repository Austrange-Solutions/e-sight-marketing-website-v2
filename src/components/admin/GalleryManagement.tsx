"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type UploadedImage = {
  _id: string;
  originalName: string;
  s3Key: string;
  cloudFrontUrl?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  altText?: string;
  description?: string;
};

type EventItem = {
  _id: string;
  title: string;
  location?: string;
  date?: string;
  participants?: string;
  shortDescription?: string;
  description?: string;
  isPublished: boolean;
  thumbnailImage?: UploadedImage | string | null;
  galleryImages?: (UploadedImage | string)[];
  createdAt?: string;
  updatedAt?: string;
};

async function getPresignedUrl(file: File) {
  const res = await fetch("/api/images/generate-presigned-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Use a semantic folder hint; API will default to S3_PREFIX if not whitelisted
    body: JSON.stringify({ filename: file.name, fileType: file.type, folder: "gallery" }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to get presigned URL");
  return res.json() as Promise<{ success: boolean; uploadUrl: string; key: string; fileUrl: string }>
}

async function uploadToS3(file: File, uploadUrl: string) {
  const put = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!put.ok) throw new Error("Upload failed");
}

async function saveImageRecord(params: { key: string; fileUrl: string; file: File; tags: string[]; description?: string; altText?: string }) {
  // API requires: filename, originalName, s3Key, cloudFrontUrl, fileSize, fileType
  const filename = params.key.split('/').pop() || params.file.name;
  const body = {
    filename,
    originalName: params.file.name,
    s3Key: params.key,
    cloudFrontUrl: params.fileUrl,
    fileSize: params.file.size,
    fileType: params.file.type,
    uploadMethod: "signed-url" as const,
    tags: params.tags,
    description: params.description || "",
    altText: params.altText || "",
  };
  const res = await fetch("/api/images", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
  if (!res.ok) throw new Error("Failed to save image record");
  const data = await res.json();
  return data.data as UploadedImage;
}

async function uploadImageAndSave(file: File, tags: string[]) {
  const presign = await getPresignedUrl(file);
  await uploadToS3(file, presign.uploadUrl);
  const img = await saveImageRecord({ key: presign.key, fileUrl: presign.fileUrl, file, tags });
  return img;
}

export default function GalleryManagement() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<string>("");
  const [participants, setParticipants] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<UploadedImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);

  // Input refs to safely reset value after async work
  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/events", { credentials: "include", cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch events");
      setEvents(data.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setDate("");
    setParticipants("");
    setShortDescription("");
    setDescription("");
    setIsPublished(true);
    setThumbnailImage(null);
    setGalleryImages([]);
  };

  const handleCreate = async () => {
    try {
      if (!title.trim()) { alert("Title is required"); return; }
      const body: any = {
        title,
        location: location || undefined,
        date: date || undefined,
        participants: participants || undefined,
        shortDescription: shortDescription || undefined,
        description: description || undefined,
        isPublished,
        thumbnailImageId: thumbnailImage?._id,
        galleryImageIds: galleryImages.map((g) => g._id),
      };
      const res = await fetch("/api/admin/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create event");
      resetForm();
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to create");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to delete");
      }
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to delete");
    }
  };

  const onThumbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setThumbnailUploading(true);
      const img = await uploadImageAndSave(file, ["event", "thumbnail"]);
      setThumbnailImage(img);
    } catch (e: any) {
      alert(e.message || "Upload failed");
    } finally {
      setThumbnailUploading(false);
      if (thumbInputRef.current) {
        thumbInputRef.current.value = "";
      }
    }
  };

  const onGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    try {
      setGalleryUploading(true);
      const uploaded: UploadedImage[] = [];
      for (const f of files) {
        const img = await uploadImageAndSave(f, ["event", "gallery"]);
        uploaded.push(img);
      }
      setGalleryImages((prev) => [...prev, ...uploaded]);
    } catch (e: any) {
      alert(e.message || "Upload failed");
    } finally {
      setGalleryUploading(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  };

  const startEdit = (ev: EventItem) => {
    setEditing(ev);
    setTitle(ev.title || "");
    setLocation(ev.location || "");
    setDate(ev.date ? ev.date.slice(0, 10) : "");
    setParticipants(ev.participants || "");
    setShortDescription(ev.shortDescription || "");
    setDescription(ev.description || "");
    setIsPublished(!!ev.isPublished);
    setThumbnailImage((ev.thumbnailImage as UploadedImage) || null);
    setGalleryImages(((ev.galleryImages as UploadedImage[]) || []).slice());
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      const body: any = {
        title,
        location: location || undefined,
        date: date || undefined,
        participants: participants || undefined,
        shortDescription: shortDescription || undefined,
        description: description || undefined,
        isPublished,
        thumbnailImage: thumbnailImage?._id || null,
        galleryImages: galleryImages.map((g) => g._id),
      };
      const res = await fetch(`/api/admin/events/${editing._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update event");
      setEditOpen(false);
      setEditing(null);
      resetForm();
      await load();
    } catch (e: any) {
      alert(e.message || "Failed to update");
    }
  };

  const removeGalleryImage = (id: string) => {
    setGalleryImages((prev) => prev.filter((g) => g._id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Event</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Title</label>
            <input className="w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />

            <label className="block text-sm font-medium">Location</label>
            <input className="w-full border rounded px-3 py-2" value={location} onChange={(e) => setLocation(e.target.value)} />

            <label className="block text-sm font-medium">Date</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />

            <label className="block text-sm font-medium">Participants</label>
            <input className="w-full border rounded px-3 py-2" value={participants} onChange={(e) => setParticipants(e.target.value)} />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Short Description</label>
            <textarea className="w-full border rounded px-3 py-2" rows={3} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />

            <label className="block text-sm font-medium">Detailed Description</label>
            <textarea className="w-full border rounded px-3 py-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

            <label className="inline-flex items-center gap-2 mt-2">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              <span>Published</span>
            </label>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center border justify-between mb-2">
              <label className="text-sm font-medium mx-2">Thumbnail Image</label>
              <input className="border p-2" ref={thumbInputRef} type="file" accept="image/*" onChange={onThumbFileChange} disabled={thumbnailUploading} />
            </div>
            {thumbnailImage ? (
              <div className="border rounded p-2 inline-flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnailImage.cloudFrontUrl || thumbnailImage.fileUrl || ""} alt={thumbnailImage.altText || thumbnailImage.originalName} className="h-16 w-16 object-cover rounded" />
                <div className="text-sm">
                  <div className="font-medium">{thumbnailImage.originalName}</div>
                  <button className="text-red-600 text-xs underline" onClick={() => setThumbnailImage(null)}>Remove</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No thumbnail selected</p>
            )}
          </div>

          <div>
            <div className="flex items-center border justify-between mb-2">
              <label className="text-sm font-medium mx-2"> Gallery Images</label>
              <input className="border p-2" ref={galleryInputRef} multiple type="file" accept="image/*" onChange={onGalleryFilesChange} disabled={galleryUploading} />
            </div>
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((img) => (
                  <div key={img._id} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.cloudFrontUrl || img.fileUrl || ""} alt={img.altText || img.originalName} className="h-20 w-full object-cover rounded" />
                    <button className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1 py-0.5 opacity-0 group-hover:opacity-100" onClick={() => removeGalleryImage(img._id)}>Remove</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No gallery images</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Create Event</button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Events</h2>
          <button onClick={load} className="text-sm text-muted-foreground underline">Refresh</button>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading events…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Published</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id} className="border-b">
                    <td className="py-2 pr-4 font-medium">{ev.title}</td>
                    <td className="py-2 pr-4">{ev.date ? new Date(ev.date).toLocaleDateString() : "-"}</td>
                    <td className="py-2 pr-4">{ev.location || "-"}</td>
                    <td className="py-2 pr-4">{ev.isPublished ? "Yes" : "No"}</td>
                    <td className="py-2 pr-4 space-x-2">
                      <button className="px-2 py-1 border rounded" onClick={() => startEdit(ev)}>Edit</button>
                      <button className="px-2 py-1 border rounded text-red-600" onClick={() => handleDelete(ev._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-4 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Edit Event</h3>
              <button onClick={() => { setEditOpen(false); setEditing(null); }}>✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium">Title</label>
                <input className="w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />

                <label className="block text-sm font-medium">Location</label>
                <input className="w-full border rounded px-3 py-2" value={location} onChange={(e) => setLocation(e.target.value)} />

                <label className="block text-sm font-medium">Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />

                <label className="block text-sm font-medium">Participants</label>
                <input className="w-full border rounded px-3 py-2" value={participants} onChange={(e) => setParticipants(e.target.value)} />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Short Description</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />

                <label className="block text-sm font-medium">Detailed Description</label>
                <textarea className="w-full border rounded px-3 py-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

                <label className="inline-flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                  <span>Published</span>
                </label>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Thumbnail Image</label>
                  <input className="border py-2" ref={thumbInputRef} type="file" accept="image/*" onChange={onThumbFileChange} disabled={thumbnailUploading} />
                </div>
                {thumbnailImage ? (
                  <div className="border rounded p-2 inline-flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailImage.cloudFrontUrl || thumbnailImage.fileUrl || ""} alt={thumbnailImage.altText || thumbnailImage.originalName} className="h-16 w-16 object-cover rounded" />
                    <div className="text-sm">
                      <div className="font-medium">{thumbnailImage.originalName}</div>
                      <button className="text-red-600 text-xs underline" onClick={() => setThumbnailImage(null)}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No thumbnail selected</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Gallery Images</label>
                  <input className="border py-2" ref={galleryInputRef} multiple type="file" accept="image/*" onChange={onGalleryFilesChange} disabled={galleryUploading} />
                </div>
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {galleryImages.map((img) => (
                      <div key={img._id} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.cloudFrontUrl || img.fileUrl || ""} alt={img.altText || img.originalName} className="h-20 w-full object-cover rounded" />
                        <button className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1 py-0.5 opacity-0 group-hover:opacity-100" onClick={() => removeGalleryImage(img._id)}>Remove</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No gallery images</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 border rounded" onClick={() => { setEditOpen(false); setEditing(null); }}>Cancel</button>
              <button className="px-3 py-2 bg-primary text-white rounded" onClick={handleUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
