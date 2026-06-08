'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activities', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      course_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      activity_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'activity_types',
          key: 'id',
        },
      },
      certificate_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'activity_statuses',
          key: 'id',
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      complementary_activity_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'complementary_activities_types',
          key: 'id',
        }
      },
      extension_activity_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'extension_activities_types',
          key: 'id',
        },
      },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE activities 
      ADD CONSTRAINT check_hours_positive 
      CHECK (hours > 0)
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('activities');
  }
};


