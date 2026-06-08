'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Backfill defensivo: eventos sem término recebem o horário de início
    // como término, para que a constraint NOT NULL possa ser aplicada.
    await queryInterface.sequelize.query(
      'UPDATE "events" SET "end_at" = "start_at" WHERE "end_at" IS NULL;',
    );

    await queryInterface.changeColumn('events', 'end_at', {
      type: Sequelize.DATE(6),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('events', 'end_at', {
      type: Sequelize.DATE(6),
      allowNull: true,
    });
  },
};
