import validator from 'validator'
import * as Yup from 'yup'
import Alunos from '../model/Alunos.js'
import { v4 } from 'uuid'
import Payments from '../model/Payment.js'

// Função de sanitização reutilizável
const sanitizeInput = (data) => {
  const sanitizedData = {}
  Object.keys(data).forEach((key) => {
    sanitizedData[key] =
      typeof data[key] === 'string' ? validator.escape(data[key]) : data[key]
  })
  return sanitizedData
}

class PaymentsController {
  async store (request, response) {
    const schema = Yup.object().shape({
      id_alunos: Yup.string().required(),
      mes_referencia: Yup.string().required(),
    })

    const sanitizedBody = sanitizeInput(request.body)

    try {
      await schema.validateSync(sanitizedBody, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const {
      id_alunos,
      mes_referencia,
    } = sanitizedBody

    const { images = [], pdfs = [] } = request.uploadedFiles || {} // A RECEBER QUANDO INICIARMOS O PAGAMENTO DE FATO

    let fileData = null

    if (pdfs.length > 0) {
      fileData = {
        file_id: pdfs[0].id,
        file_url: pdfs[0].link
      }

      console.log(fileData)
    } else if (images.length > 0) {
      fileData = {
        file_id: pdfs[0].id,
        file_url: pdfs[0].link
      }

      console.log(fileData)
    } else {
      return response.status(409).json({ error: 'payment not exists' })
    }

    const studentsExists = await Alunos.findOne({
      where: { id: id_alunos },
    })

    if (!studentsExists) {
      return response.status(409).json({ error: 'students not exists' })
    }

    await Payments.create({
      id: v4(),
      id_alunos,
      pix_comprovante: fileData.file_url,
      id_comporovante: fileData.file_id,
      mes_referencia,
    })

    return response.status(201).json({ message: 'payment created successfully' })
  }

}

export default new PaymentsController()
