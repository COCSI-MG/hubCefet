'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable('complementary_activities', 'activities');

    await queryInterface.addColumn('activities', 'complementary_activity_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'complementary_activities_types',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('activities', 'complementary_activities_type');

    await queryInterface.renameTable('activities', 'complementary_activities');
  }
};
