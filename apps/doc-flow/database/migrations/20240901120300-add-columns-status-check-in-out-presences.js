'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('presences', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
    await queryInterface.addColumn('presences', 'check_in_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('presences', 'check_out_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex('presences', ['status']);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('presences', 'status');
    await queryInterface.removeColumn('presences', 'check_in_date');
    await queryInterface.removeColumn('presences', 'check_out_date');
  }
};
