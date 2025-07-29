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
    const profiles = await queryInterface.sequelize.query(
      "SELECT id, name FROM profiles WHERE name IN ('admin', 'user');",
    );
    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles;',
    );
    for (const profile of profiles[0]) {
      switch (profile.name) {
        case 'admin':
          for (const role of roles[0]) {
            await queryInterface.sequelize.query(
              `INSERT INTO profiles_roles (profile_id, role_id, created_at, updated_at) VALUES ('${profile.id}', '${role.id}', NOW(), NOW());`,
            );
          }
          break;
        case 'user':
          for (const role of roles[0]) {
            if (
              role.name === 'VIEW_OWN' ||
              role.name === 'UPDATE_OWN' ||
              role.name === 'VIEW_ANY'
            ) {
              await queryInterface.sequelize.query(
                `INSERT INTO profiles_roles (profile_id, role_id, created_at, updated_at) VALUES ('${profile.id}', '${role.id}', NOW(), NOW());`,
              );
            }
          }
          break;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.sequelize.query('DELETE FROM profiles_roles;');
  },
};
