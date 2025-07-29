'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('review_settings', [
      {
        key: 'required_reviewers',
        required_approvals: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('review_settings', null, {});
  }
}; 
 
 