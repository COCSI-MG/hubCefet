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
    await queryInterface.bulkInsert(
      'roles',
      [
        {
          id: Sequelize.fn('uuid_generate_v4'),
          name: 'VIEW_ANY ',
        },
        {
          id: Sequelize.fn('uuid_generate_v4'),
          name: 'VIEW_OWN',
        },
        {
          id: Sequelize.fn('uuid_generate_v4'),
          name: 'CREATE_ANY',
        },
        {
          id: Sequelize.fn('uuid_generate_v4'),
          name: 'CREATE_OWN',
        },
        {
          id: Sequelize.fn('uuid_generate_v4'),
          name: 'UPDATE_ANY',
        },
        {
          id: Sequelize.fn('uuid_generate_v4'),
          name: 'UPDATE_OWN',
        },
        {
          id: Sequelize.fn('uuid_generate_v4'),
          name: 'DELETE_ANY',
        },
        {
          id: Sequelize.fn('uuid_generate_v4'),
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
