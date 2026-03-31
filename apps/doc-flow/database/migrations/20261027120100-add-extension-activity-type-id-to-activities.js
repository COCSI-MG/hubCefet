'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('activities', 'extension_activity_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'extension_activities_types',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('activities', 'extension_activity_type_id');
  }
};
