'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se as colunas existem antes de tentar removê-las
    const tableDescription = await queryInterface.describeTable('class_schedules');
    
    if (tableDescription.start_time) {
    await queryInterface.removeColumn('class_schedules', 'start_time');
    }
    
    if (tableDescription.end_time) {
    await queryInterface.removeColumn('class_schedules', 'end_time');
    }
  },

  async down(queryInterface, Sequelize) {
    // Verificar se as colunas não existem antes de tentar adicioná-las
    const tableDescription = await queryInterface.describeTable('class_schedules');
    
    if (!tableDescription.start_time) {
    await queryInterface.addColumn('class_schedules', 'start_time', {
      type: Sequelize.STRING,
      allowNull: false
    });
    }
    
    if (!tableDescription.end_time) {
    await queryInterface.addColumn('class_schedules', 'end_time', {
      type: Sequelize.STRING,
      allowNull: false
    });
    }
  }
}; 