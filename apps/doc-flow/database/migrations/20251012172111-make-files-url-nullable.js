'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make the 'url' column nullable in the files table
    await queryInterface.changeColumn('files', 'url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert: Make the 'url' column NOT NULL again
    await queryInterface.changeColumn('files', 'url', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
