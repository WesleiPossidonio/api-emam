import Jwt from 'jsonwebtoken'
import authConfig from '../../config/auth.js'

export default (request, response, next) => {
  const authToken = request.cookies['token']

  if (!authToken) {
    return response.status(401).json({ error: 'Token not provided' })
  }

  try {
    const decoded = Jwt.verify(authToken, authConfig.secret)
    request.userId = decoded.id
    return next()
  } catch {
    return response.status(401).json({ error: 'Token is invalid' })
  }
}
