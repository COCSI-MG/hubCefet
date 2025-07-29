'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('semesters');
      
      if (!tableInfo.start_date) {
        await queryInterface.addColumn('semesters', 'start_date', {
          type: Sequelize.DATEONLY,
          allowNull: true
        });
      }
      
      if (!tableInfo.end_date) {
        await queryInterface.addColumn('semesters', 'end_date', {
          type: Sequelize.DATEONLY,
          allowNull: true
        });
      }

    } catch (error) {
      console.error('Erro na migração:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('semesters');
      
      if (tableInfo.start_date) {
        await queryInterface.removeColumn('semesters', 'start_date');
      }
      
      if (tableInfo.end_date) {
        await queryInterface.removeColumn('semesters', 'end_date');
      }
    } catch (error) {
      console.error('Erro ao reverter migração:', error);
      throw error;
    }
  }
}; 