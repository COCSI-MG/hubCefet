'use strict';

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();

  return tables.some((table) => {
    if (typeof table === 'string') {
      return table === tableName;
    }

    return table.tableName === tableName;
  });
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hasComplementaryActivities = await tableExists(queryInterface, 'complementary_activities');
    const hasActivities = await tableExists(queryInterface, 'activities');

    if (hasComplementaryActivities && !hasActivities) {
      await queryInterface.renameTable('complementary_activities', 'activities');
    }

    const table = await queryInterface.describeTable('activities');

    if (!table.complementary_activity_type_id) {
      await queryInterface.addColumn('activities', 'complementary_activity_type_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'complementary_activities_types',
          key: 'id',
        },
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('activities');

    if (table.complementary_activity_type_id) {
      await queryInterface.removeColumn('activities', 'complementary_activity_type_id');
    }

    const hasActivities = await tableExists(queryInterface, 'activities');
    const hasComplementaryActivities = await tableExists(queryInterface, 'complementary_activities');

    if (hasActivities && !hasComplementaryActivities) {
      await queryInterface.renameTable('activities', 'complementary_activities');
    }
  }
};
