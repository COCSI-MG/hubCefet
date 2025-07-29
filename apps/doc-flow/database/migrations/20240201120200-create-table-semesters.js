'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('semesters', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      year: { type: Sequelize.INTEGER, allowNull: false },
      number: { type: Sequelize.INTEGER, allowNull: false }, // 1 ou 2
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('semesters');
  }
}; 