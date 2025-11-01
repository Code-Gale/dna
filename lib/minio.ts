import { Client } from 'minio'

export function getMinio() {
  const endPoint = process.env.MINIO_ENDPOINT || '127.0.0.1'
  const port = Number(process.env.MINIO_PORT || 9000)
  const accessKey = process.env.MINIO_ACCESS_KEY || ''
  const secretKey = process.env.MINIO_SECRET_KEY || ''
  const useSSL = (process.env.MINIO_USE_SSL || 'false').toLowerCase() === 'true'
  if (!accessKey || !secretKey) throw new Error('MinIO credentials missing')
  const client = new Client({ endPoint, port, accessKey, secretKey, useSSL })
  return { client, bucket: process.env.MINIO_BUCKET || 'gallery' }
}
