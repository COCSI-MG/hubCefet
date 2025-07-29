'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('time_slots', [
      { 
        start_time: '14:00', 
        end_time: '15:40', 
        created_at: now, 
        updated_at: now 
      },
      { 
        start_time: '15:40', 
        end_time: '18:00', 
        created_at: now, 
        updated_at: now 
      },
      { 
        start_time: '18:00', 
        end_time: '21:40', 
        created_at: now, 
        updated_at: now 
      },
      { 
        start_time: '21:40', 
        end_time: '22:30', 
        created_at: now, 
        updated_at: now 
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('time_slots', null, {});
  }
}; 