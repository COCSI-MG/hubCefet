'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('semesters');
      
      const promises = [];
      
      if (!tableInfo.start_date) {
        promises.push(
          queryInterface.addColumn('semesters', 'start_date', {
            type: Sequelize.DATEONLY,
            allowNull: true
          })
        );
      }
      
      if (!tableInfo.end_date) {
        promises.push(
          queryInterface.addColumn('semesters', 'end_date', {
            type: Sequelize.DATEONLY,
            allowNull: true
          })
        );
      }
      
      await Promise.all(promises);
      
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-06-30`;
      
      await queryInterface.sequelize.query(`
        UPDATE semesters 
        SET start_date = '${startDate}', end_date = '${endDate}' 
        WHERE start_date IS NULL OR end_date IS NULL
      `);
      
    } catch (error) {
      console.error('Erro na migração:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('semesters');
      
      const promises = [];
      
      if (tableInfo.start_date) {
        promises.push(queryInterface.removeColumn('semesters', 'start_date'));
      }
      
      if (tableInfo.end_date) {
        promises.push(queryInterface.removeColumn('semesters', 'end_date'));
      }
      
      await Promise.all(promises);
      
    } catch (error) {
      console.error('Erro ao reverter migração:', error);
      throw error;
    }
  }
}; 