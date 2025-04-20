import { Sequelize, Model } from 'sequelize'
class Horarios extends Model {
  static init (sequelize) {
    super.init(
      {
        id_prof: Sequelize.STRING,
        dia: Sequelize.STRING,
        horario: Sequelize.STRING,
        turno: Sequelize.STRING,
        quantidade_alunos: Sequelize.NUMBER,
        disponibilidade_alunos: Sequelize.NUMBER,
        disponibilidade_horario: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'horarios',
      }
    )
    return this
  }

  static associate (models) {
    this.belongsTo(models.ProfData, {
      foreignKey: 'id',
      as: 'alunos',
    })

    this.hasMany(models.Alunos, {
      foreignKey: 'id_hours',
      as: 'horarios_alunos',
    })

  }
}

export default Horarios