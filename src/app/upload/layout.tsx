import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AWS S3 File Uploader',
  description: 'Upload files directly to AWS S3 with CloudFront CDN',
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}