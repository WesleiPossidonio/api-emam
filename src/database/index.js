import Sequelize from 'sequelize'
import User from '../app/model/User'
import Alunos from '../app/model/Alunos'
import ProfData from '../app/model/ProfData'
import Horarios from '../app/model/Horarios'

import configDataBase from '../config/database'
import Payments from '../app/model/Payment'
import AlunosProfessores from '../app/model/AlunosProfessores'


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
