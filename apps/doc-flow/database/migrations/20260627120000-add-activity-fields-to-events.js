'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'activity_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'activity_types',
        key: 'id',
      },
    });

    await queryInterface.addColumn('events', 'complementary_activity_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'complementary_activities_types',
        key: 'id',
      },
    });

    await queryInterface.addColumn('events', 'extension_activity_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'extension_activities_types',
        key: 'id',
      },
    });

    await queryInterface.addColumn('events', 'activity_hours', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'activity_hours');
    await queryInterface.removeColumn('events', 'extension_activity_type_id');
    await queryInterface.removeColumn('events', 'complementary_activity_type_id');
    await queryInterface.removeColumn('events', 'activity_type_id');
  },
};
