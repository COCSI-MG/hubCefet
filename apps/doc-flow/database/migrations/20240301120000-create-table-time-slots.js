'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se a tabela já existe
    const tables = await queryInterface.showAllTables();
    
    if (!tables.includes('time_slots')) {
    await queryInterface.createTable('time_slots', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME,
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
    });
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    
    if (tables.includes('time_slots')) {
    await queryInterface.dropTable('time_slots');
    }
  }
}; 