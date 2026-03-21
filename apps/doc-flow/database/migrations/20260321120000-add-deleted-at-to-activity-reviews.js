'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('activity_reviews', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.removeConstraint('activity_reviews', 'unique_activity_review');

    await queryInterface.addIndex('activity_reviews', ['activity_id', 'reviewer_user_id'], {
      name: 'unique_activity_review_active',
      unique: true,
      where: {
        deleted_at: null,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('activity_reviews', 'unique_activity_review_active');

    await queryInterface.addConstraint('activity_reviews', {
      fields: ['activity_id', 'reviewer_user_id'],
      type: 'unique',
      name: 'unique_activity_review',
    });

    await queryInterface.removeColumn('activity_reviews', 'deleted_at');
  },
};
