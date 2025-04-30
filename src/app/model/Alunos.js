import { Sequelize, Model } from 'sequelize'
import bcrypt from 'bcrypt'
class Alunos extends Model {
  static init (sequelize) {
    super.init(
      {
        id_prof: Sequelize.STRING,
        id_hours: Sequelize.STRING,
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        telefone: Sequelize.STRING,
        password_hash: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        responsible_name: Sequelize.STRING,
        data_de_nascimento: Sequelize.STRING,
        experiencia_com_musica: Sequelize.BOOLEAN,
        instrumento_musical: Sequelize.STRING
        // pix_comprovante: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'alunos',
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
    this.belongsToMany(models.ProfData, {
      through: 'AlunosProfessores',
      foreignKey: 'aluno_id',
      otherKey: 'professor_id',
      as: 'professores'
    })

    this.belongsTo(models.Horarios, {
      foreignKey: 'id_hours',
      as: 'horarios_alunos',
    })

    this.hasOne(models.Payments, {
      foreignKey: 'id_alunos',
      as: 'pagamentos',
    })
  }
}

export default Alunos
