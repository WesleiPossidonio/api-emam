'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('alunos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id_hours: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'horarios',
          key: 'id',
        }
      },
      id_prof: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'prof_Data',
          key: 'id',
        }
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      responsible_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      telefone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      experiencia_com_musica: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        unique: true,
      },
      data_de_nascimento: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable('alunos')
  }
};
