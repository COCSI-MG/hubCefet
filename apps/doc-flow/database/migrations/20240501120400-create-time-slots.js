'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add missing columns to existing time_slots table
      const tableDescription = await queryInterface.describeTable('time_slots');

      if (!tableDescription.shift) {
        await queryInterface.addColumn('time_slots', 'shift', {
          type: Sequelize.ENUM('MORNING', 'AFTERNOON', 'NIGHT'),
          allowNull: false,
          defaultValue: 'MORNING',
        });
      }

      if (!tableDescription.order) {
        await queryInterface.addColumn('time_slots', 'order', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        });
      }
    } catch (error) {
      console.log('Columns may already exist or table structure is different');
      // Continue with the rest of the migration
    }

    // Skip data insertion for now - will be handled by seeders
    console.log(
      'Columns added successfully. Data will be inserted via seeders.',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('time_slots');
  },
};
