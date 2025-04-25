import mjml2html from 'mjml'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'
import * as dotenv from 'dotenv'
dotenv.config()

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // ou sua redirect URI
)

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,

})

export const sendMailStudents = async ({ email, name }) => {
  let accessToken
  try {
    const tokenResponse = await oAuth2Client.getAccessToken()
    accessToken = tokenResponse?.token
  } catch (err) {
    console.error('Erro ao gerar accessToken:', err)
    return
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

  <mj-style>
    .full-width-image img {
      width: 100% !important;
      height: auto !important;
     }
  </mj-style>

    <mjml>
      <mj-body background-color="#F4F4F4" color="#55575d" font-family="Arial, sans-serif">
      <mj-section background-color="#f2f2f2" padding="0" text-align="center" full-width="full-width">
        <mj-section background-color="#f2f2f2" padding="0" text-align="center">
          <mj-column padding="0">
            <mj-image src="https://i.imgur.com/BReyDw0l.jpg" fluid-on-mobile="true" padding="0" css-class="full-width-image"></mj-image>
          </mj-column>
        </mj-section>
        
        <mj-section background-color="#ffffff" padding="20px 0" text-align="center">
          <mj-column>
            <mj-text line-height="1.6">
              <p>
                <strong>Olá ${name} Bem Vindo ao Emam!!! </strong> <br/> 
                Espero que esteja bem. Entramos em contato para fornecer informações
                importantes sobre o acesso ao portal do aluno e matricula da nossa escola de música.
              </p>
            </mj-text>

            <mj-text>
              <h3>1º Inscrição</h3>
              <p>A Sua vaga já está reservada.</p>
              <p>
               Para garantir sua inscrição, é necessário realizar o pagamento da primeira mensalidade.
               Acesse o Portal do Aluno e efetue o pagamento via Pix na seção Finanças.
               Após a confirmação, sua matrícula será concluída com sucesso.
              </p>

              <a href="#" target="_blank" rel="noopener noreferrer">Portal do Aluno</a>
            </mj-text>

             <mj-text>
              <h3>Sobre as Aulas</h3>
              <p>As aulas terão 1 Hora de duração e serão uma vez por semana</p>
              <p>
               As aulas serão realizadas com professores especializados e com experiencia na musica gospel.
              </p>
            </mj-text>

            <mj-text color="#000" line-height="1.8">
              <strong>
                Se surgirem dúvidas ou se precisar de mais informações, por favor, não hesite em nos contatar via WhatsApp.
              </strong>
            </mj-text>
            <mj-button background-color="#25D366" href="https://wa.me/" padding="20px">Enviar Mensagem</mj-button>
          </mj-column>
        </mj-section>

        <mj-section padding="20px 0" text-align="center">
          <mj-column>
            <mj-text line-height="1.8" color="#55575d" font-family="Arial, sans-serif" font-size="11px" padding="0 20px"></mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `

  const { html } = mjml2html(mjmlCode)

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Confirmação de Inscrição Escola de Música Emam`,
    html,
    headers: {
      'X-Priority': '1',
      'Importance': 'high',
    },
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('email enviado com sucesso!!!')
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err)
  }
}
