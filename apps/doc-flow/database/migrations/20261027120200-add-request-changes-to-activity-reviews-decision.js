'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_activity_reviews_decision" ADD VALUE IF NOT EXISTS 'REQUEST_CHANGES';`
    );
  },

  async down(queryInterface, Sequelize) {
  },
};
