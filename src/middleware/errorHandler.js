export function errorHandler(error, _request, response, _next) {
  if (error.code === 11000) {
    return response.status(409).json({ error: 'An account with this email already exists.' })
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({ error: error.message })
  }

  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500
  if (status === 500) console.error(error)
  response.status(status).json({ error: status === 500 ? 'An unexpected server error occurred.' : error.message })
}