import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import { httpError } from '../utils/httpError.js'
import { toObjectId } from '../utils/objectId.js'

export async function listMessages(request, response) {
  const conversationId = toObjectId(request.params.id, 'conversationId')
  const userId = toObjectId(request.query.userId, 'userId')
  const isParticipant = await Conversation.exists({ _id: conversationId, participants: userId })
  if (!isParticipant) throw httpError(404, 'Conversation not found.')

  const parsedLimit = Number.parseInt(request.query.limit, 10)
  const limit = Number.isInteger(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50
  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
  response.json(messages.reverse())
}

export async function createMessage(request, response) {
  const conversationId = toObjectId(request.params.id, 'conversationId')
  const senderId = toObjectId(request.body?.senderId, 'senderId')
  const text = typeof request.body?.text === 'string' ? request.body.text.trim() : ''
  if (!text || text.length > 4000) throw httpError(400, 'Message text must contain 1 to 4000 characters.')

  const conversation = await Conversation.findOne({ _id: conversationId, participants: senderId })
  if (!conversation) throw httpError(404, 'Conversation not found for this sender.')

  const message = await Message.create({ conversation: conversationId, sender: senderId, text, readBy: [senderId] })
  conversation.latestMessage = message._id
  conversation.lastMessageAt = message.createdAt
  await conversation.save()
  response.status(201).json(await message.populate('sender', 'name avatar'))
}