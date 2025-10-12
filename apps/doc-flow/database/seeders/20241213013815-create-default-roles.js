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
          id: '61218c2a-368a-4e35-abb9-a4a31253523c',
          name: 'VIEW_ANY ',
        },
        {
          id: 'c96e86a7-7ed2-4b68-9675-d7ec58c9fe4d',
          name: 'VIEW_OWN',
        },
        {
          id: 'd45f7b8e-c129-4a67-8f44-e3b2d9f6a751',
          name: 'CREATE_ANY',
        },
        {
          id: 'e7a8c3d2-f456-4e89-b123-c4d5e6f7a890',
          name: 'CREATE_OWN',
        },
        {
          id: 'f89b2c5e-d678-4f9a-a234-d5e6f7a8b901',
          name: 'UPDATE_ANY',
        },
        {
          id: 'a12c4e6f-8901-4b23-b345-e6f7a8b9c012',
          name: 'UPDATE_OWN',
        },
        {
          id: 'b23d5f7a-9012-4c34-c456-f7a8b9c0d123',
          name: 'DELETE_ANY',
        },
        {
          id: 'c34e6a8b-0123-4d45-d567-a8b9c0d1e234',
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
