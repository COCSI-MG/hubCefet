'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add description field to events table
     */
    await queryInterface.addColumn('events', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Detailed description of the event',
    });
  },

  async down(queryInterface) {
    /**
     * Remove description field from events table
     */
    await queryInterface.removeColumn('events', 'description');
  },
};
