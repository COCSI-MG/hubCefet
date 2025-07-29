'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('activity_reviews', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      activity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'complementary_activities',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      reviewer_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      decision: {
        type: Sequelize.ENUM('APPROVED', 'REJECTED'),
        allowNull: false,
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Adicionando constraint UNIQUE para evitar duplicação
    await queryInterface.addConstraint('activity_reviews', {
      fields: ['activity_id', 'reviewer_user_id'],
      type: 'unique',
      name: 'unique_activity_review',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('activity_reviews');
  }
}; 
 
 