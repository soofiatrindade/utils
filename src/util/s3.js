
import { removeFile } from './file'
import { readFile, createWriteStream } from 'fs'
const AWS = require('aws-sdk')

function newS3 (s3) {
  return new AWS.S3(s3)
}

export async function upload (config, path, Key) {
  return new Promise((resolve, reject) => {
    readFile(path, async (err, data) => {
      if (err) throw reject(err)
      let s3 = newS3(config.s3)
      const params = { Bucket: config.s3.bucket, Key, Body: data }
      s3.upload(params, async (erroS3, data) => {
        if (erroS3) throw reject(erroS3)
        await removeFile(path)
        resolve(data.Key)
      })
    })
  })
}

export async function view (config, Key) {
  return new Promise((resolve, reject) => {
    let s3 = newS3(config.s3)
    const params = { Bucket: config.s3.bucket, Key }
    s3.getObject(params, (err, data) => {
      if (err) return reject(err)
      resolve(data.Body)
    })
  })
}

export async function download (config, Key, localPath) {
  return new Promise((resolve, reject) => {
    try {
      const params = { Bucket: config.s3.bucket, Key }
      let file = createWriteStream(localPath)
      let s3 = newS3(config.s3)
      let stream = s3.getObject(params).createReadStream().pipe(file)
      stream.on('error', (err) => {
        throw err
      })
      stream.on('close', () => {
        resolve(localPath)
      })
    } catch (e) {
      removeFile(localPath)
      reject(e)
    }
  })
}

export async function excluir (config, Key) {
  return new Promise((resolve, reject) => {
    let s3 = newS3(config.s3)
    const params = { Bucket: config.s3.bucket, Key }
    s3.deleteObject(params, (err, data) => {
      if (err) throw reject(err)
      resolve(true)
    })
  })
}
