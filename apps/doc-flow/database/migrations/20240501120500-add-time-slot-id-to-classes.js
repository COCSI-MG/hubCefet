'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Primeiro, verifica se a coluna já existe
      const tableInfo = await queryInterface.describeTable('classes');
      if (!tableInfo.time_slot_id) {
        await queryInterface.addColumn('classes', 'time_slot_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'time_slots',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar coluna time_slot_id:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Primeiro, verifica se a coluna existe
      const tableInfo = await queryInterface.describeTable('classes');
      if (tableInfo.time_slot_id) {
        await queryInterface.removeColumn('classes', 'time_slot_id');
      }
    } catch (error) {
      console.error('Erro ao remover coluna time_slot_id:', error);
      throw error;
    }
  }
}; 