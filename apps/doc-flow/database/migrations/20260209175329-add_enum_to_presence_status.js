'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('presences', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_presences_status";');

    await queryInterface.addColumn('presences', 'status', {
      type: Sequelize.ENUM('registred', 'present', 'finalized'),
      allowNull: false,
      defaultValue: 'registred',
    });

    await queryInterface.addIndex('presences', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('presences', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_presences_status";');

    await queryInterface.addColumn('presences', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
  }
};
