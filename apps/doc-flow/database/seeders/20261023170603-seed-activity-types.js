'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO activity_types (id, name)
      VALUES
        (1, 'Atividade Complementar'),
        (2, 'Atividade de Extensão')
      ON CONFLICT (id) DO UPDATE
      SET
        name = EXCLUDED.name;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('activity_types', {
      id: [1, 2],
    });
  },
};
