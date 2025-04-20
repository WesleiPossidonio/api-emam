import { Sequelize, Model } from 'sequelize'

class Alunos extends Model {
  static init (sequelize) {
    super.init(
      {
        id_prof: Sequelize.STRING,
        id_hours: Sequelize.STRING,
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        telefone: Sequelize.STRING,
        responsible_name: Sequelize.STRING,
        data_de_nascimento: Sequelize.STRING,
        experiencia_com_musica: Sequelize.BOOLEAN,
        // pix_comprovante: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'alunos',
      }
    )
    return this
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
