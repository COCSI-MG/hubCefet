'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const tables = [
      'users',
      'roles',
      'profiles',
      'events',
      'presences',
      'certificates',
    ];
    for (const table of tables) {
      console.debug(`Changing primary key to UUID on table ${table}`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${table} ALTER COLUMN id TYPE uuid USING id::uuid::uuid;`,
      );
    }

    await queryInterface.sequelize.query(
      'ALTER TABLE profiles_roles ALTER COLUMN profile_id TYPE uuid USING profile_id::uuid::uuid;',
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE profiles_roles ALTER COLUMN role_id TYPE uuid USING role_id::uuid::uuid;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE certificates ALTER COLUMN event_id TYPE uuid USING event_id::uuid::uuid;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE certificates ALTER COLUMN user_id TYPE uuid USING user_id::uuid::uuid;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE certificates ALTER COLUMN file_id TYPE uuid USING file_id::uuid::uuid;',
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
