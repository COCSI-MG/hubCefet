'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar se a coluna já existe
      const tableInfo = await queryInterface.describeTable('class_schedules');
      
      if (!tableInfo.time_slot_id) {
        await queryInterface.addColumn('class_schedules', 'time_slot_id', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'time_slots',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
      }
    } catch (error) {
      console.error('Erro na migração:', error);
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('class_schedules');
      
      if (tableInfo.time_slot_id) {
        await queryInterface.removeColumn('class_schedules', 'time_slot_id');
      }
    } catch (error) {
      console.error('Erro ao reverter migração:', error);
      throw error;
    }
  }
}; 