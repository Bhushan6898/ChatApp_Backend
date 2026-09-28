import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  avatar: { type: String, default: '', maxlength: 500 },
  isOnline: { type: Boolean, default: false },
  lastSeenAt: { type: Date, default: null },
}, { timestamps: true })

userSchema.index({ name: 1 })

export default mongoose.models.User || mongoose.model('User', userSchema)