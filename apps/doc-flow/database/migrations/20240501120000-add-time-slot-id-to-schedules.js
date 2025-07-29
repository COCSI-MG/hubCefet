'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se a coluna já existe
    const tableDescription = await queryInterface.describeTable('class_schedules');
    
    if (!tableDescription.time_slot_id) {
    await queryInterface.addColumn('class_schedules', 'time_slot_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'time_slots',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    const [timeSlots] = await queryInterface.sequelize.query(
      'SELECT id FROM time_slots ORDER BY id LIMIT 1;'
    );
    
    if (timeSlots.length > 0) {
      const defaultTimeSlotId = timeSlots[0].id;
      
      await queryInterface.sequelize.query(
        'UPDATE class_schedules SET time_slot_id = :timeSlotId WHERE time_slot_id IS NULL',
        {
          replacements: { timeSlotId: defaultTimeSlotId }
        }
      );

      await queryInterface.changeColumn('class_schedules', 'time_slot_id', {
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
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('class_schedules');
    
    if (tableDescription.time_slot_id) {
    await queryInterface.removeColumn('class_schedules', 'time_slot_id');
    }
  }
}; 