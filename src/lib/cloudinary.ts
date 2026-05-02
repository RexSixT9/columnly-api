import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import config from '@/config';
import { logger } from '@/lib/winston';

cloudinary.config({
  cloud_name: config.cloudinaryName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
  secure: true,
});

const uploadToCloudinary = (
  buffer: Buffer,
  publicId?: string,
): Promise<UploadApiResponse | undefined> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'image',
          public_id: publicId,
          folder: 'columnly_blogs',
          transformation: { quality: 'auto' },
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        },
        (err, result) => {
          if (err) {
            logger.error(`Cloudinary upload error: ${err}`);
            reject(err);
          } else {
            logger.info(`Cloudinary upload successful: ${result?.secure_url}`);
            resolve(result);
          }
        },
      )
      .end(buffer);
  });
};

export default uploadToCloudinary;
