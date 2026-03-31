'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_time_slots_day_of_week";');
  }
};

