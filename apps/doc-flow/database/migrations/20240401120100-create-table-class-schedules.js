'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('class_schedules', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'classes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      day_of_week: { type: Sequelize.STRING, allowNull: false },
      start_time: { type: Sequelize.STRING, allowNull: false },
      end_time: { type: Sequelize.STRING, allowNull: false },
      building_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'buildings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'rooms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('class_schedules');
  }
}; 