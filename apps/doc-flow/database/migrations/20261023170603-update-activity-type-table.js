'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('activity_types', 'description')
    await queryInterface.removeColumn('activity_types', 'created_at')
    await queryInterface.removeColumn('activity_types', 'updated_at')

    await queryInterface.bulkInsert('activity_types', [
      { name: 'Atividades Complementares' },
      { name: 'Atividades de Extensão' },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('complementary_activities_types', {
      name: ['Atividades Complementares', 'Atividades de Extensão'],
    });

    await queryInterface.addColumn('activity_types', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('activity_types', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    await queryInterface.addColumn('activity_types', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

  }
};
