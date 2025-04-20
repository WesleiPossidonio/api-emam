'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('horarios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      dia: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      horario: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      turno: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      quantidade_alunos: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      disponibilidade_alunos: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      disponibilidade_horario: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Disponível'
      },
      id_prof: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'prof_Data',
          key: 'id',
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })
  },



  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('horarios')
  }
};
