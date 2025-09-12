// Utility functions for AWS S3 file uploads via CloudFront

export interface UploadResponse {
  uploadUrl: string;
  viewUrl: string;
  filename: string;
  s3Key: string;
}

/**
 * Get CloudFront URL for existing image
 */
export async function getImageUrl(filename: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/aws?key_data=${filename}`);
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Failed to get image URL:', error);
    return null;
  }
}

/**
 * Get signed upload URL and CloudFront view URL
 */
export async function getUploadUrl(filename: string, contentType?: string): Promise<UploadResponse | null> {
  try {
    const response = await fetch('/api/aws', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        contentType
      })
    });

    if (!response.ok) {
      throw new Error(`Upload URL generation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get upload URL:', error);
    return null;
  }
}

/**
 * Upload file directly to S3 using signed URL
 */
export async function uploadFileToS3(file: File): Promise<string | null> {
  try {
    // Get upload URL
    const uploadData = await getUploadUrl(file.name, file.type);
    if (!uploadData) {
      throw new Error('Failed to get upload URL');
    }

    // Upload file to S3
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      }
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    // Return the CloudFront URL for immediate use
    return uploadData.viewUrl;
  } catch (error) {
    console.error('Failed to upload file:', error);
    return null;
  }
}

/**
 * Upload file and save URL to database
 */
export async function uploadAndSaveProduct(productData: Record<string, unknown>, imageFile?: File) {
  try {
    let imageUrl = productData.image; // existing image URL

    // Upload new image if provided
    if (imageFile) {
      const uploadedUrl = await uploadFileToS3(imageFile);
      if (!uploadedUrl) {
        throw new Error('Failed to upload image');
      }
      imageUrl = uploadedUrl;
    }

    // Save product with CloudFront URL
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...productData,
        image: imageUrl // CloudFront URL saved to database
      })
    });

    return response.json();
  } catch (error) {
    console.error('Failed to upload and save product:', error);
    throw error;
  }
}