import { Router } from 'express'
import { createUser, listUsers, loginUser } from '../controllers/userController.js'

const router = Router()

router.get('/', listUsers)
router.post('/register', createUser)
router.post('/login', loginUser)

export default router