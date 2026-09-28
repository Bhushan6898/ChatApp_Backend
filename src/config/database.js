import mongoose from 'mongoose'

export async function connectToDatabase() {
  const { MONGODB_URI } = process.env
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Configure it in backend/.env before starting the API.')
  }

  await mongoose.connect(MONGODB_URI)
  console.log(`MongoDB connected: ${mongoose.connection.name}`)
}