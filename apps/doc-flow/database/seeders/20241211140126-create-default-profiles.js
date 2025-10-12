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

    return await queryInterface.bulkInsert(
      'profiles',
      [
        {
          id: uuidv4(),
          name: 'admin',
        },
        {
          id: uuidv4(),
          name: 'user',
        },
        {
          id: uuidv4(),
          name: 'professor',
        },
        {
          id: uuidv4(),
          name: 'student',
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
    return await queryInterface.bulkDelete('profiles', null, {});
  },
};
