import * as Yup from 'yup'
import validator from 'validator'
import jwt from 'jsonwebtoken'
import authConfig from '../../config/auth'
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
      name: Yup.string().required(),
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

    const { name, password } = sanitizedBody;

    const user = await User.findOne({ where: { name } });
    const prof = await ProfData.findOne({ where: { name } });
    const students = await Alunos.findOne({ where: { name } })

    // Nenhum dos dois encontrados
    if (!user && !prof && !students) {
      return nameOrPasswordIncorrect();
    }

    // Tenta login como usuário
    if (user && (await user.checkPassword(password))) {
      const token = jwt.sign({ id: user.id }, authConfig.secret, {
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
        registration: user.registration,
      });
    }

    // Tenta login como Estudante
    if (students && (await students.checkPassword(password))) {
      const token = jwt.sign({ id: students.id, name: students.name }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      response.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false, // Apenas em produção
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // LAX em desenvolvimento+++
        maxAge: 24 * 60 * 60 * 1000,
      })

      return response.json({
        name: students.name,
        email: students.email,
        registration: students.registration,
      });
    }


    // Tenta login como profissional
    if (prof && (await prof.checkPassword(password))) {
      const token = jwt.sign({ id: prof.id, name: prof.name }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      response.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false, // Apenas em produção
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // LAX em desenvolvimento+++
        maxAge: 24 * 60 * 60 * 1000,
      })

      return response.json({
        name: prof.name,
        admin: prof.admin,
        email: prof.email,
        registration: prof.registration,
      });
    }

    // Senha incorreta
    return nameOrPasswordIncorrect();
  }


  async index (request, response) {
    const token = request.cookies['token']

    if (!token) {
      return response.status(401).json({ error: 'Token not provided' });
    }

    try {
      const decoded = jwt.verify(token, authConfig.secret);
      response.status(200).json({ message: 'Authenticated', userId: decoded.id });
    } catch {
      return response.status(401).json({ error: 'Token is invalid or expired' });
    }
  }

}

export default new SessionController()
