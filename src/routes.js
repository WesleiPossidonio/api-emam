import { Router } from 'express'

import AlunosController from './app/controlles/AlunosController.js'
import SessionController from './app/controlles/SessionsController.js'
import HorariosController from './app/controlles/HorariosController.js'
import { upload, uploadToGoogleDrive } from './config/multer.js'
import ProfDataController from './app/controlles/ProfDataController.js'
import UserController from './app/controlles/UserController.js'
import authMiddlewares from './app/meddleawares/auth'
import PaymentController from './app/controlles/PaymentController.js'

const routes = new Router()

routes.post('/session', SessionController.store)
routes.get('/check-auth', SessionController.index)
routes.post('/createAlunos', AlunosController.store)
routes.get('/getAlunos', AlunosController.index)

routes.post('/payment', upload, uploadToGoogleDrive, PaymentController.store)

// routes.use(authMiddlewares)
routes.post('/createHours', HorariosController.store)
routes.get('/getHours', HorariosController.index)

routes.post('/createProf', ProfDataController.store)
routes.get('/getProf', ProfDataController.index)

routes.post('/createUser', UserController.store)
routes.get('/getUser', UserController.index)

export default routes;


