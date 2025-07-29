'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // Verificar se as colunas já existem
    const tableDescription = await queryInterface.describeTable('events');
    
    if (!tableDescription.start_at) {
      await queryInterface.addColumn('events', 'start_at', {
        type: Sequelize.DATE(6),
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
      await queryInterface.addIndex('events', ['start_at']);
    }
    
    if (!tableDescription.end_at) {
      await queryInterface.addColumn('events', 'end_at', {
        type: Sequelize.DATE(6),
      });
      await queryInterface.addIndex('events', ['end_at']);
    }
    
    if (!tableDescription.status) {
      await queryInterface.addColumn('events', 'status', {
        type: Sequelize.ENUM('started', 'ended', 'upcoming'),
        defaultValue: 'upcoming',
      });
      await queryInterface.addIndex('events', ['status']);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Verificar se as colunas existem antes de tentar removê-las
    const tableDescription = await queryInterface.describeTable('events');
    
    if (tableDescription.start_at) {
      await queryInterface.removeIndex('events', ['start_at']);
      await queryInterface.removeColumn('events', 'start_at');
    }
    
    if (tableDescription.end_at) {
      await queryInterface.removeIndex('events', ['end_at']);
      await queryInterface.removeColumn('events', 'end_at');
    }
    
    if (tableDescription.status) {
      await queryInterface.removeIndex('events', ['status']);
      await queryInterface.removeColumn('events', 'status');
    }
  },
};
