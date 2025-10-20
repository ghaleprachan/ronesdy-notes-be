/**
 * AWS Storage Service
 * Handles all interactions with AWS S3 for file storage operations.
 * Provides methods for uploading, retrieving, and deleting files from S3 buckets.
 */

import aws, { S3 } from 'aws-sdk';
import config from '../../config';

// Configure AWS credentials
aws.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

export default class AWSStorage {
  private s3: aws.S3;
  private bucketName: string;

  constructor() {
    this.s3 = new aws.S3();
    this.bucketName = config.AWS_BUCKET_NAME;
  }

  /**
   * Uploads a file to AWS S3
   * @param file - The file object containing buffer and mimetype
   * @param key - The S3 key (path) where the file will be stored
   * @returns Promise resolving to the S3 upload result
   * @throws Error if upload fails
   */
  async uploadToS3(file: any, key: any) {
    const params: S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const result = await this.s3.upload(params).promise();
      return result;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  /**
   * Retrieves a signed URL for accessing a file from S3
   * @param key - The S3 key (path) of the file to retrieve
   * @returns Promise resolving to the signed URL or null if not found
   * @throws Error if retrieval fails
   */
  async getAFile(key: any) {
    const params: S3.GetObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      const result = await this.s3.getSignedUrlPromise('getObject', params);
      return result || null;
    } catch (error) {
      console.error('Error retrieving profile picture from S3 folder:', error);
      throw error;
    }
  }

  /**
   * Deletes a single file from S3
   * @param key - The S3 key (path) of the file to delete
   * @returns Promise resolving to the delete result or null
   * @throws Error if deletion fails
   */
  async deleteFile(key: any) {
    const params: S3.DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      let result = this.s3.deleteObject(params, (err, data) => {
        if (err) {
          return err;
        } else {
          return data;
        }
      });
      return result || null;
    } catch (error) {
      console.error('Error retrieving profile picture from S3 folder:', error);
      throw error;
    }
  }

  /**
   * Deletes all files associated with a user from S3
   * @param id - The user ID whose files should be deleted
   * @returns Promise resolving to the delete result or empty array
   * @throws Error if deletion fails
   */
  async deleteAllUserFiles(id: any) {
    const params: S3.ListObjectsV2Request = {
      Bucket: this.bucketName,
      Prefix: 'userFiles/' + id + '/',
    };

    try {
      const list = await this.s3.listObjectsV2(params).promise();
      const objectsToDelete: any = list.Contents?.map(obj => ({ Key: obj.Key }));
      let result: any;
      if (objectsToDelete.length > 0) {
        const deleteParams = {
          Bucket: this.bucketName,
          Delete: {
            Objects: objectsToDelete,
            Quiet: false, // Set to true to suppress response output about deleted objects
          },
        };
  
        result = await this.s3.deleteObjects(deleteParams).promise();
        console.log(result);
      } else {
        console.log('No objects found to delete.');
      }
      return result || [];
    } catch (error) {
      console.error('Error retrieving files from S3 folder:', error);
      throw error;
    }
  }
}
