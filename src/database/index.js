import Sequelize from 'sequelize'
import User from '../app/model/User.js'
import Alunos from '../app/model/Alunos.js'
import ProfData from '../app/model/ProfData.js'
import Horarios from '../app/model/Horarios.js'

import configDataBase from '../config/database.js'
import Payments from '../app/model/Payment.js'
import AlunosProfessores from '../app/model/AlunosProfessores.js'


const models = [User, Alunos, ProfData, Horarios, Payments, AlunosProfessores]

class Database {
  constructor() {
    this.init()
  }

  init () {
    this.connection = new Sequelize(configDataBase)
    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      )
  }
}

export default new Database()
