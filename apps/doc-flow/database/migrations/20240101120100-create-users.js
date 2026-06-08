'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      full_name: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: true,
      },
      enrollment: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profile_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'profiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
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

    await queryInterface.addIndex('users', ['email']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
