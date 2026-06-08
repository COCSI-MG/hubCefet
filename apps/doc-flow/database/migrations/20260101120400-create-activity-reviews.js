'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activity_reviews', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      activity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'activities',
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
        type: Sequelize.ENUM('APPROVED', 'REJECTED', 'REQUEST_CHANGES'),
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      }
    });

    await queryInterface.addIndex('activity_reviews', ['activity_id', 'reviewer_user_id'], {
      name: 'unique_activity_review_active',
      unique: true,
      where: {
        deleted_at: null,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activity_reviews');
  }
};


