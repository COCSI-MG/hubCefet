'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const classes = await queryInterface.sequelize.query(
      'SELECT id, time_slot_id, schedule FROM classes',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.removeColumn('classes', 'schedule');
    await queryInterface.removeColumn('classes', 'time_slot_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('classes', 'schedule', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};

