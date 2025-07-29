'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar se as colunas já existem
      const tableInfo = await queryInterface.describeTable('classes');

      // Adicionar coluna name se não existir
      if (!tableInfo.name) {
        await queryInterface.addColumn('classes', 'name', {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Sem nome', // Valor padrão para registros existentes
        });
      }

      // Adicionar coluna schedule se não existir
      if (!tableInfo.schedule) {
        await queryInterface.addColumn('classes', 'schedule', {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Horário não definido', // Valor padrão para registros existentes
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar colunas name e schedule:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('classes');

      // Remover coluna name se existir
      if (tableInfo.name) {
        await queryInterface.removeColumn('classes', 'name');
      }

      // Remover coluna schedule se existir
      if (tableInfo.schedule) {
        await queryInterface.removeColumn('classes', 'schedule');
      }
    } catch (error) {
      console.error('Erro ao remover colunas name e schedule:', error);
      throw error;
    }
  }
}; 