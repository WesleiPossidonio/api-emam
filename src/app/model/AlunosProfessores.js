import { Model } from 'sequelize'
class AlunosProfessores extends Model {
  static init (sequelize) {
    super.init({}, {
      sequelize,
      tableName: 'alunos_professores'
    })
    return this
  }

}

export default AlunosProfessores
