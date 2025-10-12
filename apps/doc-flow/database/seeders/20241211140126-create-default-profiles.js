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
          id: '514c5e8d-d430-40e2-b878-f263c3f9d796',
          name: 'admin',
        },
        {
          id: '718c2e4d-a241-4db9-9c55-e8b1f3d7c849',
          name: 'user',
        },
        {
          id: 'a92d5f6e-c342-4fb7-8e11-d6a9c7b4e582',
          name: 'professor',
        },
        {
          id: 'b84f7a2e-f153-4c8a-9b66-c2d8e9a7f341',
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
