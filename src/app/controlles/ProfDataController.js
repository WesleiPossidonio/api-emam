import { v4 } from 'uuid'
import validator from 'validator'
import * as Yup from 'yup'
import ProfData from '../model/ProfData'
import Horarios from '../model/Horarios'
import Alunos from '../model/Alunos'

// Função de sanitização reutilizável
const sanitizeInput = (data) => {
  const sanitizedData = {}
  Object.keys(data).forEach((key) => {
    sanitizedData[key] =
      typeof data[key] === 'string' ? validator.escape(data[key]) : data[key]
  })
  return sanitizedData
}

class ProfDataController {
  async store (request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
      telefone_contato: Yup.string().required(),
      update_number: Yup.string().optional(),
      instrumento_musical: Yup.string().required()
    })

    const sanitizedBody = sanitizeInput(request.body)

    try {
      await schema.validateSync(sanitizedBody, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const {
      name,
      email,
      password,
      telefone_contato,
      update_number,
      instrumento_musical
    } = sanitizedBody

    const emailUserExists = await ProfData.findOne({
      where: { email },
    })

    const nameUserExists = await ProfData.findOne({
      where: { name },
    })

    const numberTelExists = await ProfData.findOne({
      where: { telefone_contato },
    })

    if (emailUserExists || numberTelExists || nameUserExists) {
      return response.status(409).json({ error: 'User user already exists' })
    }

    const dataProf = await ProfData.create({
      id: v4(),
      name,
      email,
      password,
      telefone_contato,
      update_number,
      instrumento_musical
    })

    return response.status(201).json(dataProf)
  }

  async index (request, response) {
    const listExercices = await ProfData.findAll({
      order: [['createdAt', 'ASC']],
      include: [
        // {
        //   model: Horarios,
        //   as: 'meus_horarios_disponiveis', // Alias correto conforme definido no modelo
        //   attributes: [
        //     'id',
        //     'dia',
        //     'horario',
        //     'turno',
        //     'disponibilidade_horario',
        //     'disponibilidade_alunos',
        //     'quantidade_alunos',
        //   ],

        // },
        {
          model: Alunos,
          as: 'alunos', // Alias correto conforme definido no modelo
          attributes: [
            'id',
            'name',
            'email',
            'telefone',
            'experiencia_com_musica',
            'data_de_nascimento',
            'responsible_name',
          ],
          include: [
            {
              model: Horarios,
              as: 'horarios_alunos', // Alias correto conforme definido no modelo
              attributes: [
                'id',
                'dia',
                'horario',
                'turno',
                'quantidade_alunos',
                'disponibilidade_alunos',
                'disponibilidade_horario',
              ]
            }
          ]
        }
      ]
    })
    return response.json(listExercices)
  }

  async update (request, response) {
    const schema = Yup.object().shape({
      update_number: Yup.string().optional(),
      password: Yup.string().optional().min(6),
      name: Yup.string().optional(),
      email: Yup.string().email().optional(),
    })

    const sanitizedBody = sanitizeInput(request.body)

    try {
      await schema.validateSync(sanitizedBody, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const { password, update_number, name, email, registration } = sanitizedBody
    const { id } = request.params // Assumindo que `id` seja passado na URL (ex: /users/:id)

    if (update_number) {
      const verificationNumber = await ProfData.findOne({
        where: { update_number },
      })

      if (!verificationNumber) {
        return response.status(400).json({ error: 'Invalid update number' })
      }

      const profData = await ProfData.findOne({
        where: { update_number }
      })

      if (password) profData.password = password
      await user.save();

      return response
        .status(200)
        .json({ message: 'Password updated successfully' })
    }

    const verificationUser = await ProfData.findOne({
      where: { id },
    })

    if (!verificationUser) {
      return response.status(404).json({ error: 'Prof not found' })
    }

    if (name) verificationUser.name = name
    if (email) verificationUser.email = email
    if (registration) verificationUser.registration = registration
    if (password) verificationUser.password = password

    await verificationUser.save();
    return response.status(200).json({ message: 'Prof updated successfully' })
  }
}

export default new ProfDataController()
