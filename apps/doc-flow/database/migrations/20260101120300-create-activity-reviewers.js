'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activity_reviewers', {
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
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('activity_reviewers', {
      fields: ['activity_id', 'reviewer_user_id'],
      type: 'unique',
      name: 'unique_activity_reviewer',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activity_reviewers');
  }
};


