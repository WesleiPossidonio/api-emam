'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('prof_Data', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      telefone_contato: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      instrumento_musical1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      instrumento_musical2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      update_number: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
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
    await queryInterface.dropTable('prof_Data')
  }
};
