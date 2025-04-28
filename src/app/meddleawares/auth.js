import Jwt from 'jsonwebtoken'
import authConfig from '../../config/auth.js'

export default (request, response, next) => {
  const { role } = request.cookies;

  const tokenMap = {
    admin: request.cookies['token'],
    prof: request.cookies['token_prof'],
    students: request.cookies['token_aluno'],
  };

  const token = tokenMap[role];

  if (!token) {
    return response.status(400).json({ error: 'Invalid role or token not provided' });
  }

  try {
    const decoded = Jwt.verify(token, authConfig.secret);
    request.userId = decoded.id;
    request.userRole = decoded.role;
    return next();
  } catch {
    return response.status(401).json({ error: 'Token is invalid or expired' });
  }

}
