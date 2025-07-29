'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('activity_statuses', [
      {
        id: 1,
        name: 'PENDING',
        description: 'Atividade aguardando aprovação dos professores',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'APPROVED',
        description: 'Atividade aprovada por todos os professores necessários',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: 'REJECTED',
        description: 'Atividade rejeitada por pelo menos um professor',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('activity_statuses', null, {});
  },
}; 
 
 