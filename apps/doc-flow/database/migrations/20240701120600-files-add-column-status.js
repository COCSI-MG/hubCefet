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
    await queryInterface.addColumn('files', 'status', {
      type: Sequelize.ENUM('done', 'processing', 'waiting', 'error'),
      allowNull: false,
      defaultValue: 'waiting',
      after: 'type',
    });

    await queryInterface.addIndex('files', ['status']);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return await queryInterface.removeColumn('files', 'status');
  }
};
