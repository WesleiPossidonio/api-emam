import * as Yup from 'yup';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth.js';
import User from '../model/User.js';
import Alunos from '../model/Alunos.js';
import ProfData from '../model/ProfData.js';

const sanitizeInput = (data) => {
  const sanitizedData = {};
  Object.keys(data).forEach((key) => {
    sanitizedData[key] = typeof data[key] === 'string' ? validator.escape(data[key]) : data[key];
  });
  return sanitizedData;
};

class SessionController {
  async store (request, response) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    const sanitizedBody = sanitizeInput(request.body);
    const { email, password } = sanitizedBody;

    const nameOrPasswordIncorrect = () => {
      return response.status(400).json({ error: 'Make sure your password or name are correct' });
    };

    if (!(await schema.isValid(sanitizedBody))) {
      return nameOrPasswordIncorrect();
    }

    const user = await User.findOne({ where: { email } });
    const students = await Alunos.findOne({ where: { email } });
    const prof = await ProfData.findOne({ where: { email } });

    // Admin
    if (user && (await user.checkPassword(password))) {
      const token = jwt.sign({ id: user.id, role: 'admin' }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      return response.json({
        token,
        name: user.name,
        email: user.email,
        role: 'admin',
      });
    }

    // Estudante
    if (students && (await students.checkPassword(password))) {
      const token = jwt.sign({ id: students.id, role: 'students' }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      return response.json({
        token,
        name: students.name,
        email: students.email,
        role: 'students',
      });
    }

    // Profissional
    if (prof && (await prof.checkPassword(password))) {
      const token = jwt.sign({ id: prof.id, role: 'prof' }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      return response.json({
        token,
        name: prof.name,
        email: prof.email,
      });
    }

    return nameOrPasswordIncorrect();
  }

  async index (request, response) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return response.status(401).json({ error: 'Token not provided' });
    }

    const [, token] = authHeader.split(' '); // "Bearer <token>"

    try {
      const decoded = jwt.verify(token, authConfig.secret);
      const { id, role } = decoded;

      let user;

      if (role === 'admin') {
        user = await User.findByPk(id);
      } else if (role === 'students') {
        user = await Alunos.findByPk(id);
      } else if (role === 'prof') {
        user = await ProfData.findByPk(id);
      }

      if (!user) {
        return response.status(401).json({ error: 'Usuário não encontrado' });
      }

      return response.status(200).json({
        message: 'Authenticated',
        userId: user.id,
        name: user.name,
        role,
      });
    } catch (err) {
      return response.status(401).json({ error: 'Token is invalid or expired' });
    }
  }
}

export default new SessionController();
