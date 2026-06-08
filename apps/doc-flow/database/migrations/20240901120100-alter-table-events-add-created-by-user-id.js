'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'created_by_user_id');
  },
};
