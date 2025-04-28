import Jwt from 'jsonwebtoken'
import authConfig from '../../config/auth.js'

export default (request, response, next) => {
  const role = request.query.role;

  let token;

  if (role === 'admin') {
    token = request.cookies['token'];
  } else if (role === 'prof') {
    token = request.cookies['token_prof'];
  } else if (role === 'students') {
    token = request.cookies['token_aluno'];
  } else {
    return response.status(400).json({ error: 'Invalid role provided' });
  }

  if (!token) {
    return response.status(401).json({ error: 'Token not provided' });
  }

  try {
    const decoded = Jwt.verify(token, authConfig.secret);
    request.userId = decoded.id;
    return next();
  } catch {
    return response.status(401).json({ error: 'Token is invalid' });
  }
}
