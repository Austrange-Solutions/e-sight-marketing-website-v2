'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CarouselManagement() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/images?tags=carousel&limit=200');
      const data = await res.json();
      if (data && data.success) {
        setImages(data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Select a file first');
    setUploading(true);
    try {
      // Request presigned URL from backend (admin endpoint)
      const presignedRes = await fetch('/api/images/generate-presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, fileType: file.type, folder: 'carousel' }),
      });
      const presignedData = await presignedRes.json();
      if (!presignedData || !presignedData.uploadUrl) throw new Error('Failed to get upload URL');

      // Upload file directly to S3 (PUT)
      await fetch(presignedData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      // Save metadata in DB
      const saveRes = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: presignedData.key.split('/').pop(),
          originalName: file.name,
          s3Key: presignedData.key,
          cloudFrontUrl: presignedData.fileUrl,
          s3Url: presignedData.fileUrl,
          fileSize: file.size,
          fileType: file.type,
          tags: ['carousel'],
          uploadMethod: 'signed-url'
        })
      });

      const saved = await saveRes.json();
      if (saved && saved.success) {
        toast.success('Image uploaded and saved');
        setFile(null);
        fetchImages();
      } else {
        console.error('Save failed', saved);
        toast.error('Failed to save image metadata');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data && data.success) {
        toast.success('Image deleted');
        fetchImages();
      } else {
        toast.error('Delete failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  const startEdit = (img: any) => {
    setEditing({ ...img });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/images/${editing._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          altText: editing.altText,
          description: editing.description,
          isActive: editing.isActive,
        })
      });
      const data = await res.json();
      if (data && data.success) {
        toast.success('Saved');
        setEditing(null);
        fetchImages();
      } else {
        toast.error('Save failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Save failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Homepage Carousel</h2>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className='border p-1'>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="flex gap-2">
          <button onClick={handleUpload} disabled={!file || uploading} className="px-3 py-1 bg-primary text-white rounded disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload to Carousel'}
          </button>
          <button onClick={fetchImages} className="px-3 py-1 border rounded">Refresh</button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : images.length === 0 ? (
        <div>No carousel images configured</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map(img => (
            <div key={img._id} className="border p-2 rounded bg-card flex flex-col">
              <div className="w-full h-40 bg-gray-100 rounded overflow-hidden">
                <img src={img.cloudFrontUrl || img.s3Url} alt={img.altText || img.originalName} className="w-full h-full object-cover" />
              </div>
              <div className="mt-2 text-sm font-medium truncate">{img.filename}</div>
              <div className="text-xs text-muted-foreground truncate">{img.originalName}</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(img)} className="px-2 py-1 border rounded text-sm">Edit</button>
                  <button onClick={() => handleDelete(img._id)} className="px-2 py-1 border text-destructive text-sm ">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal / Inline */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-card p-6 rounded-lg w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-2">Edit Slide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="w-full h-48 bg-gray-100 rounded overflow-hidden">
                  <img src={editing.cloudFrontUrl || editing.s3Url} alt={editing.altText || editing.originalName} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="block text-sm">Alt Text</label>
                <input value={editing.altText || ''} onChange={(e) => setEditing({ ...editing, altText: e.target.value })} className="w-full p-2 border rounded" />
                <label className="block text-sm">Description</label>
                <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full p-2 border rounded" rows={3} />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={cancelEdit} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={saveEdit} className="px-3 py-1 bg-primary text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
