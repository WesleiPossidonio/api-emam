import Jwt from 'jsonwebtoken'
import authConfig from '../../config/auth.js'

export default (request, response, next) => {

  let token = null;

  if (request.cookies['token']) {
    token = request.cookies['token'];
  } else if (request.cookies['token_prof']) {
    token = request.cookies['token_prof'];
  } else if (request.cookies['token_aluno']) {
    token = request.cookies['token_aluno'];
  }

  if (!token) {
    return response.status(401).json({ error: 'Token not provided' });
  }

  try {
    const decoded = Jwt.verify(token, authConfig.secret);
    request.userId = decoded.id;
    request.userRole = decoded.role; // <<< aqui já guarda o role
    return next();
  } catch {
    return response.status(401).json({ error: 'Token is invalid or expired' });
  }


}
