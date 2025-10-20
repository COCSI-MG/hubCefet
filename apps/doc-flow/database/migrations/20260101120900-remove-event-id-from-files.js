'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /**
     * Remove event_id column from files table
     */
    await queryInterface.removeColumn('files', 'event_id');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add event_id column back to files table
     * Note: This will restore the column but any data will be lost
     */
    await queryInterface.addColumn('files', 'event_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};
