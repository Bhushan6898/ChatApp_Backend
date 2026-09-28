import { Router } from 'express'
import { createUser, listUsers } from '../controllers/userController.js'

const router = Router()

router.get('/', listUsers)
router.post('/', createUser)

export default router