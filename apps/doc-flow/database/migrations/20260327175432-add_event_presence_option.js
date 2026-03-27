'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'presence_option', {
      type: Sequelize.ENUM('geo', 'qrcode'),
      allowNull: false,
      defaultValue: 'qrcode'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'event_presence_option')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_events_presence_option";');
  }
};
