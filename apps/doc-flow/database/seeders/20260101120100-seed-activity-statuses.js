'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO activity_statuses (id, name, description, created_at, updated_at)
      VALUES
        (1, 'PENDING', 'Atividade aguardando aprovação dos professores', NOW(), NOW()),
        (2, 'APPROVED', 'Atividade aprovada por todos os professores necessários', NOW(), NOW()),
        (3, 'REJECTED', 'Atividade rejeitada por pelo menos um professor', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE
      SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        updated_at = NOW();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('activity_statuses', null, {});
  },
}; 
 
 
