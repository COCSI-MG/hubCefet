'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('classes', 'room_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'rooms',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('classes', 'room_id');
  }
};
