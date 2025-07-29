'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('events', 'latitude', {
      type: Sequelize.FLOAT,
      default: 0,
    });
    await queryInterface.addColumn('events', 'longitude', {
      type: Sequelize.FLOAT,
      default: 0,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('events', 'latitude');
    await queryInterface.removeColumn('events', 'longitude');
  },
};
