import * as Yup from 'yup'
import mjml2html from 'mjml'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import { google } from 'googleapis'

import authConfig from '../../config/auth'
import User from '../model/User'
import ProfData from '../model/ProfData'
import Alunos from '../model/Alunos'

class ConfirmEmailController {
  async store (request, response) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
    })

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Email inválido' })
    }

    const { email } = request.body
    const lowerEmail = email.toLowerCase()
    const verificationNumber = Math.floor(Math.random() * 400001) + 100000

    // Busca usuário em qualquer uma das tabelas
    const [user, dataProf, student] = await Promise.all([
      User.findOne({ where: { email: lowerEmail } }),
      ProfData.findOne({ where: { email: lowerEmail } }),
      Alunos.findOne({ where: { email: lowerEmail } }),
    ])

    const account = user || dataProf || student

    if (!account) {
      return response.status(400).json({ error: 'Email não encontrado' })
    }

    await account.update({ update_number: verificationNumber })

    // Configuração OAuth2
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    )

    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

    let accessToken
    try {
      const tokenResponse = await oAuth2Client.getAccessToken()
      accessToken = tokenResponse?.token
    } catch (err) {
      console.error('Erro ao obter o access token:', err)
      return response.status(500).json({ error: 'Erro ao gerar token de acesso' })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken,
      },
    })

    const mjmlCode = `
      <mjml>
        <mj-body background-color="#F4F4F4" font-family="Arial, sans-serif">
          <mj-section background-color="#000" padding="25px">
            <mj-column>
              <mj-text color="#ffffff" font-size="20px" align="center">
                <strong>Emam</strong>
              </mj-text>
            </mj-column>
          </mj-section>

          <mj-section background-color="#fff" padding="20px">
            <mj-column>
              <mj-text color="#000" font-size="18px" font-weight="bold">
                Atualização de Senha
              </mj-text>
              <mj-text color="#000" font-size="16px">
                Número de Verificação: <strong>${verificationNumber}</strong>
              </mj-text>
              <mj-text color="#000">
                Clique no botão abaixo para atualizar sua senha:
              </mj-text>
              <mj-button background-color="#000" color="#fff" href="https://www.emam.com.br/Atualizar-Senha">
                Clique Aqui
              </mj-button>
            </mj-column>
          </mj-section>

          <mj-section background-color="#55575d" padding="20px">
            <mj-column>
              <mj-text color="#ffffff" font-size="13px" align="center">
                Emam - Escola de Música Advec Macaé
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `

    let html
    try {
      const { html: convertedHtml } = mjml2html(mjmlCode)
      html = convertedHtml
    } catch (error) {
      console.error('Erro ao converter MJML:', error)
      return response.status(500).json({ error: 'Erro ao gerar o e-mail' })
    }

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Atualização de Senha',
      html,
    }

    try {
      await transporter.sendMail(mailOptions)
      return response.status(200).json({
        token: jwt.sign({ id: account.id }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      })
    } catch (error) {
      console.error('Erro ao enviar o e-mail:', error)
      return response.status(500).json({ error: 'Erro ao enviar e-mail' })
    }
  }
}

export default new ConfirmEmailController()
