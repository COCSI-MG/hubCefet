'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar se a coluna existe antes de removê-la
      const tableDescription = await queryInterface.describeTable('class_schedules');
      
      if (tableDescription.day_of_week) {
      await queryInterface.removeColumn('class_schedules', 'day_of_week');
      }

      // Verificar se os índices já existem antes de criá-los
      try {
      await queryInterface.addIndex('class_schedules', ['class_id', 'time_slot_id', 'room_id'], {
        name: 'unique_class_time_room',
        unique: true
      });
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }

      try {
      await queryInterface.addIndex('class_schedules', ['time_slot_id', 'room_id'], {
        name: 'unique_time_room',
        unique: true
      });
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }

      await queryInterface.changeColumn('class_schedules', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });

      await queryInterface.changeColumn('class_schedules', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });

    } catch (error) {
      console.error('Erro ao adicionar restrições em class_schedules:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Verificar se os índices existem antes de removê-los
    try {
      await queryInterface.removeIndex('class_schedules', 'unique_class_time_room');
      } catch (error) {
        if (!error.message.includes('does not exist')) {
          throw error;
        }
      }

      try {
      await queryInterface.removeIndex('class_schedules', 'unique_time_room');
      } catch (error) {
        if (!error.message.includes('does not exist')) {
          throw error;
        }
      }

      // Verificar se a coluna não existe antes de adicioná-la
      const tableDescription = await queryInterface.describeTable('class_schedules');
      
      if (!tableDescription.day_of_week) {
      await queryInterface.addColumn('class_schedules', 'day_of_week', {
        type: Sequelize.STRING,
        allowNull: true
      });
      }

      await queryInterface.changeColumn('class_schedules', 'created_at', {
        type: Sequelize.DATE,
        allowNull: true
      });

      await queryInterface.changeColumn('class_schedules', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: true
      });

    } catch (error) {
      console.error('Erro ao remover restrições de class_schedules:', error);
      throw error;
    }
  }
}; 