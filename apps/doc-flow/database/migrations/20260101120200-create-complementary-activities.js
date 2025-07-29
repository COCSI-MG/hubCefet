'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('complementary_activities', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
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
    });

    // Adicionando constraint de CHECK para hours > 0
    await queryInterface.sequelize.query(`
      ALTER TABLE complementary_activities 
      ADD CONSTRAINT check_hours_positive 
      CHECK (hours > 0)
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('complementary_activities');
  }
}; 
 
 