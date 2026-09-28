import Conversation from '../models/Conversation.js'
import User from '../models/User.js'
import { httpError } from '../utils/httpError.js'
import { toObjectId } from '../utils/objectId.js'

const populatedConversation = (query) => query
  .populate('participants', 'name avatar isOnline lastSeenAt')
  .populate({ path: 'latestMessage', populate: { path: 'sender', select: 'name avatar' } })

export async function listConversations(request, response) {
  const userId = toObjectId(request.query.userId, 'userId')
  const filter = { participants: userId }
  const folder = request.query.folder

  if (folder === 'archived') filter.archivedBy = userId
  else if (folder === 'starred') filter.starredBy = userId
  else if (!folder || folder === 'inbox') filter.archivedBy = { $ne: userId }
  else throw httpError(400, 'folder must be inbox, starred, or archived.')

  const conversations = await populatedConversation(
    Conversation.find(filter).sort({ lastMessageAt: -1 }).limit(100),
  )
  response.json(conversations)
}

export async function createConversation(request, response) {
  const creatorId = toObjectId(request.body?.userId, 'userId')
  const participantIds = Array.isArray(request.body?.participantIds) ? request.body.participantIds : []
  const ids = [...new Set([creatorId.toString(), ...participantIds.map((id) => toObjectId(id, 'participantId').toString())])]
  if (ids.length < 2) throw httpError(400, 'A conversation needs at least two different users.')

  const participants = await User.find({ _id: { $in: ids } }).select('_id').lean()
  if (participants.length !== ids.length) throw httpError(404, 'One or more participants were not found.')

  const isGroup = ids.length > 2
  const title = typeof request.body.title === 'string' ? request.body.title.trim() : ''
  if (isGroup && !title) throw httpError(400, 'Group conversations require a title.')

  const conversation = await Conversation.create({ title, participants: ids, createdBy: creatorId, isGroup })
  response.status(201).json(await populatedConversation(Conversation.findById(conversation._id)))
}

export async function getConversation(request, response) {
  const conversationId = toObjectId(request.params.id, 'conversationId')
  const userId = toObjectId(request.query.userId, 'userId')
  const conversation = await populatedConversation(
    Conversation.findOne({ _id: conversationId, participants: userId }),
  )
  if (!conversation) throw httpError(404, 'Conversation not found.')
  response.json(conversation)
}

export async function updateConversation(request, response) {
  const conversationId = toObjectId(request.params.id, 'conversationId')
  const userId = toObjectId(request.body?.userId, 'userId')
  const updates = {}

  for (const [field, modelField] of [['archived', 'archivedBy'], ['starred', 'starredBy']]) {
    if (request.body[field] !== undefined) {
      if (typeof request.body[field] !== 'boolean') throw httpError(400, `${field} must be a boolean.`)
      const operator = request.body[field] ? '$addToSet' : '$pull'
      updates[operator] ??= {}
      updates[operator][modelField] = userId
    }
  }
  if (!Object.keys(updates).length) throw httpError(400, 'Provide archived and/or starred as a boolean.')

  const conversation = await populatedConversation(Conversation.findOneAndUpdate(
    { _id: conversationId, participants: userId },
    updates,
    { new: true, runValidators: true },
  ))
  if (!conversation) throw httpError(404, 'Conversation not found.')
  response.json(conversation)
}