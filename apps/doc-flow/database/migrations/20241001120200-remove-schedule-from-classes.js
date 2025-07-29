'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const classes = await queryInterface.sequelize.query(
        'SELECT id, time_slot_id, schedule FROM classes',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      await queryInterface.removeColumn('classes', 'schedule');
      await queryInterface.removeColumn('classes', 'time_slot_id');
    } catch (error) {
      console.error('Erro ao remover colunas de classes:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('classes', 'time_slot_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'time_slots',
          key: 'id'
        }
      });

      await queryInterface.addColumn('classes', 'schedule', {
        type: Sequelize.STRING,
        allowNull: true
      });

    } catch (error) {
      console.error('Erro ao restaurar colunas em classes:', error);
      throw error;
    }
  }
}; 
 