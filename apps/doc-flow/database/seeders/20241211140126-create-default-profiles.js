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
    return await queryInterface.bulkInsert(
      'profiles',
      [
        {
          id: Sequelize.fn('uuid_generate_v4'),
          name: 'admin',
        },
        {
          id: Sequelize.fn('uuid_generate_v4'),
          name: 'user',
        },
        {
          id: Sequelize.fn('uuid_generate_v4'),
          name: 'professor',
        },
        {
          id: Sequelize.fn('uuid_generate_v4'),
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
