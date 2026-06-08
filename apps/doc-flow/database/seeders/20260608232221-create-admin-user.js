'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO users (
        id, 
        full_name, 
        password, 
        created_at, 
        updated_at, 
        profile_id, 
        email, 
        enrollment
      ) VALUES (
        'c197fe2b-1de6-4eb7-9429-54da80ceac95', 
        'Admin', 
        '$2a$10$q5Rah5BnWqoVGzxa.3wVfuNk4DG2w9u8UU578uPOLJY1j9P4Hzgjq', 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP, 
        '514c5e8d-d430-40e2-b878-f263c3f9d796', 
        'admin@cefet-rj.br', 
        '1234567SINF'
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
