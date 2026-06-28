'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'min_checkin_time', {
      type: Sequelize.INTEGER,
      defaultValue: 15,
      allowNull: false,
    });

    await queryInterface.addColumn('events', 'max_checkin_time', {
      type: Sequelize.INTEGER,
      defaultValue: 15,
      allowNull: false,
    });

    await queryInterface.addColumn('events', 'min_checkout_time', {
      type: Sequelize.INTEGER,
      defaultValue: 15,
      allowNull: false,
    });

    await queryInterface.addColumn('events', 'max_checkout_time', {
      type: Sequelize.INTEGER,
      defaultValue: 15,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'min_checkin_time');
    await queryInterface.removeColumn('events', 'max_checkin_time');
    await queryInterface.removeColumn('events', 'min_checkout_time');
    await queryInterface.removeColumn('events', 'max_checkout_time');
  },
};
