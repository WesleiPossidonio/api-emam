'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('payment', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      mes_referencia: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      pix_comprovante: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      id_comporovante: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      id_alunos: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'alunos',
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
    await queryInterface.dropTable('payment')
  }
};
