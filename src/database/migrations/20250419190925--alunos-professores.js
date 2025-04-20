'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('alunos_professores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      aluno_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'alunos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'prof_Data', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })
  },

  async down (queryInterface) {
    await queryInterface.dropTable('alunos_professores')
  }
}
