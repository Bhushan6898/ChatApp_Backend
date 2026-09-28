import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { httpError } from '../utils/httpError.js'

function publicUser(user) {
  const result = user.toObject()
  delete result.passwordHash
  return result
}

export async function createUser(request, response) {
 
  
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const password = typeof request.body?.password === 'string' ? request.body.password : ''

  if (!name || !email || password.length < 8) {
    throw httpError(400, 'Name, a valid email, and a password of at least 8 characters are required.')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError(400, 'Email address is invalid.')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, passwordHash })

  response.status(201).json(publicUser(user))
}

export async function loginUser(request, response) {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const password = typeof request.body?.password === 'string' ? request.body.password : ''

  if (!email || !password) {
    throw httpError(400, 'Email and password are required.')
  }

  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError(401, 'Invalid email or password.')
  }

  const result = publicUser(user)
  console.log('Login response:', result)
  response.json(result)
}

export async function listUsers(request, response) {
  const search = typeof request.query.search === 'string' ? request.query.search.trim().slice(0, 50) : ''
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const users = await User.find(search ? { name: new RegExp(escapedSearch, 'i') } : {})
    .select('name avatar isOnline lastSeenAt')
    .sort({ name: 1 })
    .limit(50)
    .lean()

  response.json(users)
}