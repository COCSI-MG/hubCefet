'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO review_settings (key, required_approvals, created_at, updated_at)
      VALUES ('required_reviewers', 3, NOW(), NOW())
      ON CONFLICT (key) DO UPDATE
      SET
        required_approvals = EXCLUDED.required_approvals,
        updated_at = NOW();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('review_settings', null, {});
  }
};
 
 
