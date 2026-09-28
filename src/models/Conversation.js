import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 120, default: '' },
  participants: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    validate: {
      validator: (participants) => participants.length >= 2,
      message: 'A conversation must have at least two participants.',
    },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isGroup: { type: Boolean, default: false },
  archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true })

conversationSchema.index({ participants: 1, lastMessageAt: -1 })

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema)