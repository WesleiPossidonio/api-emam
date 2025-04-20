
import validator from 'validator'
import * as Yup from 'yup'

import { v4 } from 'uuid'
import Horarios from '../model/Horarios.js'
import ProfData from '../model/ProfData.js'

// Função de sanitização reutilizável
const sanitizeInput = (data) => {
  const sanitizedData = {}
  Object.keys(data).forEach((key) => {
    sanitizedData[key] =
      typeof data[key] === 'string' ? validator.escape(data[key]) : data[key]
  })
  return sanitizedData
}

class HorariosController {
  async store (request, response) {
    const schema = Yup.object().shape({
      id_prof: Yup.string().required(),
      dia: Yup.string().required(),
      horario: Yup.string().required().min(6),
      turno: Yup.string().required(),
      quantidade_alunos: Yup.string().required(),
      disponibilidade_horario: Yup.number().optional(),
      disponibilidade_alunos: Yup.number().optional(),
    })

    const sanitizedBody = sanitizeInput(request.body)

    try {
      await schema.validateSync(sanitizedBody, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const {
      id_prof,
      dia,
      horario,
      turno,
      disponibilidade_horario,
      quantidade_alunos,
      disponibilidade_alunos
    } = sanitizedBody


    const dataProf = await ProfData.findOne({
      where: { id: id_prof },
    })

    if (!dataProf) {
      return response.status(409).json({ error: 'Prof not exists' })
    }

    const dateExists = await Horarios.findOne({
      where: { horario, id_prof: id_prof },
    })

    if (dateExists) {
      return response.status(409).json({ error: 'date already exists' })
    }

    await Horarios.create({
      id: v4(),
      id_prof,
      dia,
      horario,
      turno,
      disponibilidade_horario,
      quantidade_alunos,
      disponibilidade_alunos
    })

    return response.status(201).json({ message: 'Date created successfully' })
  }

  async index (request, response) {
    const listExercices = await Horarios.findAll()
    return response.json(listExercices)
  }

  async update (request, response) {
    const schema = Yup.object().shape({
      dia: Yup.string().optional(),
      horario: Yup.string().optional(),
      turno: Yup.string().optional(),
      disponibilidade_horario: Yup.string().optional(),
      quantidade_alunos: Yup.number().optional(),
      disponibilidade_alunos: Yup.number().optional(),
    })

    const sanitizedBody = sanitizeInput(request.body)

    try {
      await schema.validateSync(sanitizedBody, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const { dia, horario, turno, disponibilidade_horario, quantidade_alunos, disponibilidade_alunos } = sanitizedBody
    const { id } = request.params // Assumindo que `id` seja passado na URL (ex: /users/:id)

    const verificationUser = await Horarios.findOne({
      where: { id },
    })

    if (!verificationUser) {
      return response.status(404).json({ error: 'Prof not found' })
    }

    if (dia) verificationUser.dia = dia
    if (horario) verificationUser.horario = horario
    if (turno) verificationUser.turno = turno
    if (disponibilidade_horario) verificationUser.disponibilidade_horario = disponibilidade_horario
    if (quantidade_alunos) verificationUser.quantidade_alunos = quantidade_alunos
    if (disponibilidade_alunos) verificationUser.disponibilidade_alunos = disponibilidade_alunos

    await verificationUser.save();
    return response.status(200).json({ message: 'Prof updated successfully' })
  }
}

export default new HorariosController()
