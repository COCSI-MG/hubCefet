'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO roles (id, name, created_at, updated_at)
      VALUES
        ('61218c2a-368a-4e35-abb9-a4a31253523c', 'VIEW_ANY ', NOW(), NOW()),
        ('c96e86a7-7ed2-4b68-9675-d7ec58c9fe4d', 'VIEW_OWN', NOW(), NOW()),
        ('d45f7b8e-c129-4a67-8f44-e3b2d9f6a751', 'CREATE_ANY', NOW(), NOW()),
        ('e7a8c3d2-f456-4e89-b123-c4d5e6f7a890', 'CREATE_OWN', NOW(), NOW()),
        ('f89b2c5e-d678-4f9a-a234-d5e6f7a8b901', 'UPDATE_ANY', NOW(), NOW()),
        ('a12c4e6f-8901-4b23-b345-e6f7a8b9c012', 'UPDATE_OWN', NOW(), NOW()),
        ('b23d5f7a-9012-4c34-c456-f7a8b9c0d123', 'DELETE_ANY', NOW(), NOW()),
        ('c34e6a8b-0123-4d45-d567-a8b9c0d1e234', 'DELETE_OWN', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE
      SET
        name = EXCLUDED.name,
        updated_at = NOW();
    `);
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
