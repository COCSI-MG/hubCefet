'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('activity_reviews', 'activity_reviews_activity_id_fkey');

    await queryInterface.addConstraint('activity_reviews', {
      fields: ['activity_id'],
      type: 'foreign key',
      name: 'activity_reviews_activity_id_fkey',
      references: {
        table: 'activities',
        field: 'id',
      },
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('activity_reviews', 'activity_reviews_activity_id_fkey');

    await queryInterface.addConstraint('activity_reviews', {
      fields: ['activity_id'],
      type: 'foreign key',
      name: 'activity_reviews_activity_id_fkey',
      references: {
        table: 'complementary_activities',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });
  }
};
