import { Injectable } from '@nestjs/common';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.S3_BUCKET_ACCESS_SECRET_KEY,
      },
    });
  }

  async uploadFile(data: Buffer, key: string): Promise<string | undefined> {
    try {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Body: data,
        Key: key,
      };
      await this.s3Client.send(new PutObjectCommand(params));
      return params.Key;
    } catch (e) {
      console.error('Error', e);
    }
  }

  async getObjectSignedUrl(key: string) {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };
    const command = new GetObjectCommand(params);
    const seconds = 900;
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: seconds,
    });
    return url;
  }
}
