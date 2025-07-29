'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // Verificar se as colunas já existem
    const tableDescription = await queryInterface.describeTable('users');

    if (!tableDescription.email) {
      await queryInterface.addColumn('users', 'email', {
        type: Sequelize.STRING(254),
      });
      await queryInterface.addIndex('users', ['email']);
    }

    if (!tableDescription.enrollment) {
      await queryInterface.addColumn('users', 'enrollment', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Verificar se a coluna username ainda existe antes de renomeá-la
    if (tableDescription.username && !tableDescription.full_name) {
      await queryInterface.renameColumn('users', 'username', 'full_name');
      await queryInterface.changeColumn('users', 'full_name', {
        type: Sequelize.STRING(100),
      });
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Verificar se as colunas existem antes de tentar removê-las
    const tableDescription = await queryInterface.describeTable('users');
    
    if (tableDescription.email) {
      await queryInterface.removeIndex('users', ['email']);
      await queryInterface.removeColumn('users', 'email');
    }
    
    if (tableDescription.enrollment) {
      await queryInterface.removeColumn('users', 'enrollment');
    }
    
    if (tableDescription.full_name && !tableDescription.username) {
      await queryInterface.renameColumn('users', 'full_name', 'username');
    }
  },
};
