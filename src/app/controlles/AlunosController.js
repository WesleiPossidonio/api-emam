import validator from 'validator'
import * as Yup from 'yup'
import Alunos from '../model/Alunos.js'
import { v4 } from 'uuid'
import Horarios from '../model/Horarios.js'
import ProfData from '../model/ProfData.js'
import { sendMailStudents } from '../sendMail/index.js'


// Função de sanitização reutilizável
const sanitizeInput = (data) => {
  const sanitizedData = {}
  Object.keys(data).forEach((key) => {
    sanitizedData[key] =
      typeof data[key] === 'string' ? validator.escape(data[key]) : data[key]
  })
  return sanitizedData
}

class AlunosController {
  async store (request, response) {
    const schema = Yup.object().shape({
      id_prof: Yup.string().required(),
      id_hours: Yup.string().required(),
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
      telefone: Yup.string().required(),
      experiencia_com_musica: Yup.string().required(),
      data_de_nascimento: Yup.string().required(),
      responsible_name: Yup.string().required(),
    })

    const sanitizedBody = sanitizeInput(request.body)

    try {
      await schema.validateSync(sanitizedBody, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const {
      id_hours,
      id_prof,
      name,
      email,
      telefone,
      experiencia_com_musica,
      responsible_name,
      password
    } = sanitizedBody

    const { data_de_nascimento } = request.body

    const alunoExistente = await Alunos.findOne({
      where: { email },
      include: {
        association: 'professores',
      },
    })

    // Verifica se horário existe e se ainda está disponível
    const hoursData = await Horarios.findOne({ where: { id: id_hours } })
    const ProfExist = await ProfData.findOne({ where: { id: id_prof } })

    if (!hoursData || !ProfExist) {
      return response.status(404).json({ error: 'Horário ou Professor não encontrado' })
    }

    if (
      hoursData.disponibilidade_horario === 'Indisponível' ||
      hoursData.disponibilidade_alunos >= hoursData.quantidade_alunos
    ) {
      return response.status(409).json({ error: 'Horário já está indisponível' })
    }

    let aluno

    if (alunoExistente) {
      aluno = alunoExistente

      // Verifica se o professor já está associado a esse aluno
      const profData = aluno.professores.some(
        (prof) => prof.id === id_prof
      )

      if (profData) {
        return response.status(409).json({ error: 'Aluno já está vinculado a esse professor' })
      }

      // Adiciona o novo professor ao aluno existente
      await aluno.addProfessores(id_prof)
    } else {
      // Cria um novo aluno
      aluno = await Alunos.create({
        id: v4(),
        id_hours,
        id_prof,
        name,
        email,
        telefone,
        password,
        experiencia_com_musica,
        responsible_name,
        data_de_nascimento,
      })

      // Associa o professor
      await aluno.addProfessores(id_prof)
    }

    // Atualiza disponibilidade do horário
    hoursData.disponibilidade_alunos += 1

    if (hoursData.disponibilidade_alunos >= hoursData.quantidade_alunos) {
      hoursData.disponibilidade_horario = 'Indisponível'
    }

    await hoursData.save()

    // Envia o e-mail
    try {
      await sendMailStudents({ email, name })
    } catch (err) {
      console.error('Erro ao enviar e-mail após pagamento:', err)
      // Você pode optar por continuar sem retornar erro aqui se o pagamento foi salvo com sucesso
    }


    return response.status(201).json({ message: 'Aluno atualizado ou criado com sucesso' })
  }

  async index (request, response) {
    const listAlunos = await Alunos.findAll({
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: Horarios,
          as: 'horarios_alunos',
          attributes: [
            'id',
            'dia',
            'horario',
            'turno',
          ]
        },
        {
          model: ProfData,
          as: 'professores',
          attributes: [
            'id',
            'name',
            'email',
            'instrumento_musical',
            'telefone_contato'
          ]
        }
      ]
    })
    return response.json(listAlunos)
  }
}

export default new AlunosController()
