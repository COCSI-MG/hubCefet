'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const timeSlots = await queryInterface.sequelize.query(
        'SELECT id, shift, "order" FROM time_slots',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      await queryInterface.addColumn('time_slots', 'day_of_week', {
        type: Sequelize.ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
        allowNull: false,
        defaultValue: 'MONDAY'
      });

      await queryInterface.removeColumn('time_slots', 'shift');
      await queryInterface.removeColumn('time_slots', 'order');

      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_time_slots_shift";');
    } catch (error) {
      console.error('Erro ao modificar a estrutura de time_slots:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('time_slots', 'shift', {
        type: Sequelize.ENUM('MORNING', 'AFTERNOON', 'NIGHT'),
        allowNull: false,
        defaultValue: 'MORNING'
      });

      await queryInterface.addColumn('time_slots', 'order', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      });

      await queryInterface.removeColumn('time_slots', 'day_of_week');

      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_time_slots_day_of_week";');
    } catch (error) {
      console.error('Erro ao restaurar a estrutura original de time_slots:', error);
      throw error;
    }
  }
}; 
 