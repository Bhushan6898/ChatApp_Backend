import mongoose from 'mongoose'
import { httpError } from './httpError.js'

export function toObjectId(value, label = 'ID') {
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
    throw httpError(400, `${label} is invalid.`)
  }
  return new mongoose.Types.ObjectId(value)
}