'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.sequelize.query(`
      INSERT INTO profiles (id, name, created_at, updated_at)
      VALUES
        ('514c5e8d-d430-40e2-b878-f263c3f9d796', 'admin', NOW(), NOW()),
        ('718c2e4d-a241-4db9-9c55-e8b1f3d7c849', 'user', NOW(), NOW()),
        ('a92d5f6e-c342-4fb7-8e11-d6a9c7b4e582', 'professor', NOW(), NOW()),
        ('b84f7a2e-f153-4c8a-9b66-c2d8e9a7f341', 'student', NOW(), NOW())
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
    return await queryInterface.bulkDelete('profiles', null, {});
  },
};
