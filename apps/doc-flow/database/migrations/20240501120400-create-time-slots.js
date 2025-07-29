'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('time_slots', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      shift: {
        type: Sequelize.ENUM('MORNING', 'AFTERNOON', 'NIGHT'),
        allowNull: false
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    const now = new Date();
    // Inserir os horários padrão
    await queryInterface.bulkInsert('time_slots', [
      // Manhã
      { start_time: '07:30', end_time: '09:10', shift: 'MORNING', order: 1, created_at: now, updated_at: now },
      { start_time: '09:20', end_time: '11:00', shift: 'MORNING', order: 2, created_at: now, updated_at: now },
      { start_time: '11:10', end_time: '12:50', shift: 'MORNING', order: 3, created_at: now, updated_at: now },
      
      // Tarde
      { start_time: '13:00', end_time: '14:40', shift: 'AFTERNOON', order: 1, created_at: now, updated_at: now },
      { start_time: '14:50', end_time: '16:30', shift: 'AFTERNOON', order: 2, created_at: now, updated_at: now },
      { start_time: '16:40', end_time: '18:20', shift: 'AFTERNOON', order: 3, created_at: now, updated_at: now },
      
      // Noite
      { start_time: '18:30', end_time: '20:10', shift: 'NIGHT', order: 1, created_at: now, updated_at: now },
      { start_time: '20:20', end_time: '22:00', shift: 'NIGHT', order: 2, created_at: now, updated_at: now }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('time_slots');
  }
}; 