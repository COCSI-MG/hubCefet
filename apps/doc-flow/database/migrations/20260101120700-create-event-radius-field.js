'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add radius field to events table
     */
    await queryInterface.addColumn('events', 'radius', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'Event radius in meters for location-based events',
    });
  },

  async down(queryInterface) {
    /**
     * Remove radius field from events table
     */
    await queryInterface.removeColumn('events', 'radius');
  }
};
