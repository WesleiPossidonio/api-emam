import { Sequelize, Model } from 'sequelize'
import bcrypt from 'bcrypt'
class ProfData extends Model {
  static init (sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        instrumento_musical1: Sequelize.STRING,
        instrumento_musical2: Sequelize.STRING,
        telefone_contato: Sequelize.STRING,
        update_number: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'prof_Data',
      }
    )

    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 10)
      }
    })

    return this
  }

  checkPassword (password) {
    return bcrypt.compare(password, this.password_hash)
  }

  static associate (models) {
    this.belongsToMany(models.Alunos, {
      through: 'AlunosProfessores',
      foreignKey: 'professor_id',
      otherKey: 'aluno_id',
      as: 'alunos'
    })

    this.hasOne(models.Horarios, {
      foreignKey: 'id_prof',
      as: 'horarios',
    })
  }

}

export default ProfData

