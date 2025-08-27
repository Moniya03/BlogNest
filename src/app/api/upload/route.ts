import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryResult>((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          folder: 'blognest',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result as CloudinaryResult);
          else reject(new Error('Upload failed'));
        }
      );
    });

    return NextResponse.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 