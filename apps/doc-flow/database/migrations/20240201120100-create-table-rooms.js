'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rooms', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      building_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'buildings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('rooms');
  }
}; 