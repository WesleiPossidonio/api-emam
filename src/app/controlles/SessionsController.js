import * as Yup from 'yup'
import validator from 'validator'
import jwt from 'jsonwebtoken'
import authConfig from '../../config/auth.js'
import User from '../model/User.js'
import ProfData from '../model/ProfData.js'
import Alunos from '../model/Alunos.js'

// Função de sanitização reutilizável
const sanitizeInput = (data) => {
  const sanitizedData = {}
  Object.keys(data).forEach((key) => {
    sanitizedData[key] =
      typeof data[key] === 'string' ? validator.escape(data[key]) : data[key]
  })
  return sanitizedData
}

class SessionController {
  async store (request, response) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    const nameOrPasswordIncorrect = () => {
      return response
        .status(400)
        .json({ error: 'Make sure your password or name are correct' });
    };

    const sanitizedBody = sanitizeInput(request.body);

    if (!(await schema.isValid(sanitizedBody))) {
      return nameOrPasswordIncorrect();
    }

    const { password, email } = sanitizedBody;

    const user = await User.findOne({ where: { email }, });
    const prof = await ProfData.findOne({ where: { email }, });
    const students = await Alunos.findOne({ where: { email }, })

    // Nenhum dos dois encontrados
    if (!user && !prof && !students) {
      return nameOrPasswordIncorrect();
    }

    // Tenta login como usuário
    if (user && (await user.checkPassword(password))) {
      const token = jwt.sign({ id: user.id, role: 'admin' }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });


      response.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false, // Apenas em produção
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // LAX em desenvolvimento+++
        maxAge: 24 * 60 * 60 * 1000,
      })

      return response.json({
        name: user.name,
        admin: user.admin,
        email: user.email,
        role: 'admin'
      });
    }

    // Tenta login como Estudante
    if (students && (await students.checkPassword(password))) {
      const token = jwt.sign({ id: students.id, name: students.name, role: 'students' }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      response.cookie('token_aluno', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false, // Apenas em produção
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // LAX em desenvolvimento+++
        maxAge: 24 * 60 * 60 * 1000,
      })

      return response.json({
        name: students.name,
        email: students.email,
        role: 'students',
      });
    }

    // Tenta login como profissional
    if (prof && (await prof.checkPassword(password))) {
      const token = jwt.sign({ id: prof.id, name: prof.name, role: 'prof' }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      response.cookie('token_prof', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false, // Apenas em produção
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // LAX em desenvolvimento+++
        maxAge: 24 * 60 * 60 * 1000,
      })

      return response.json({
        name: prof.name,
        admin: prof.admin,
        email: prof.email,
        role: 'prof',
      });
    }

    // Senha incorreta
    return nameOrPasswordIncorrect();
  }


  async index (request, response) {
    const token = request.cookies['token'] || request.cookies['token_prof'] || request.cookies['token_aluno'];

    if (!token) {
      return response.status(401).json({ error: 'Token not provided' });
    }

    try {
      const decoded = jwt.verify(token, authConfig.secret);
      const { id, role } = decoded;

      let user;

      if (role === 'admin') {
        user = await User.findByPk(id);
      } else if (role === 'aluno') {
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

export default new SessionController()
