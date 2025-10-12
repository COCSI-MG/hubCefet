'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const { v4: uuidv4 } = require('uuid');

    await queryInterface.bulkInsert(
      'roles',
      [
        {
          id: uuidv4(),
          name: 'VIEW_ANY ',
        },
        {
          id: uuidv4(),
          name: 'VIEW_OWN',
        },
        {
          id: uuidv4(),
          name: 'CREATE_ANY',
        },
        {
          id: uuidv4(),
          name: 'CREATE_OWN',
        },
        {
          id: uuidv4(),
          name: 'UPDATE_ANY',
        },
        {
          id: uuidv4(),
          name: 'UPDATE_OWN',
        },
        {
          id: uuidv4(),
          name: 'DELETE_ANY',
        },
        {
          id: uuidv4(),
          name: 'DELETE_OWN',
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('roles', null, {});
  },
};
