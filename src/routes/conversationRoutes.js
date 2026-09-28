import { Router } from 'express'
import {
  createConversation,
  getConversation,
  listConversations,
  updateConversation,
} from '../controllers/conversationController.js'
import { createMessage, listMessages } from '../controllers/messageController.js'

const router = Router()

router.get('/', listConversations)
router.post('/', createConversation)
router.get('/:id/messages', listMessages)
router.post('/:id/messages', createMessage)
router.get('/:id', getConversation)
router.patch('/:id', updateConversation)

export default router