import { Sequelize, Model } from 'sequelize'
class Payments extends Model {
  static init (sequelize) {
    super.init(
      {
        id_alunos: Sequelize.STRING,
        pix_comprovante: Sequelize.STRING,
        id_comporovante: Sequelize.STRING,
        mes_referencia: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'payment',
      }
    )
    return this
  }

  static associate (models) {
    this.belongsTo(models.Alunos, {
      foreignKey: 'id',
      as: 'alunos',
    })
  }
}

export default Payments
