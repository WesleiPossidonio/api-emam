import { Router } from 'express'

import AlunosController from './app/controlles/AlunosController.js'
import SessionController from './app/controlles/SessionsController.js'
import HorariosController from './app/controlles/HorariosController.js'
import { upload, uploadToGoogleDrive } from './config/multer.js'
import ProfDataController from './app/controlles/ProfDataController.js'
import UserController from './app/controlles/UserController.js'
import authMiddlewares from './app/meddleawares/auth.js'
import PaymentController from './app/controlles/PaymentController.js'
import ConfirmEmailController from './app/controlles/ConfirmEmailController.js'

const routes = new Router()

routes.post('/session', SessionController.store)
routes.get('/check-auth', SessionController.index)
routes.post('/createAlunos', AlunosController.store)
routes.get('/getHours', HorariosController.index)
routes.post('/payment', upload, uploadToGoogleDrive, PaymentController.store)
routes.get('/getProf', ProfDataController.index)
routes.post('/confirmMail', ConfirmEmailController.store)
routes.patch('/updatePassword/:id', UserController.update)
routes.patch('/updatePasswordProf/:id', ProfDataController.update)
routes.patch('/updatePasswordStudents/:id', AlunosController.update)
routes.post('/createProf', ProfDataController.store)
routes.post('/createUser', UserController.store)

routes.use(authMiddlewares)
routes.get('/getAlunos', AlunosController.index)
routes.post('/atualizar-alunos', AlunosController.update)
routes.post('/createHours', HorariosController.store)
routes.get('/getUser', UserController.index)

routes.put('/updateUser/:id', UserController.update)
routes.put('/updatedProf/:id', ProfDataController.update)
routes.put('/updateStudents/:id', AlunosController.update)

export default routes;


