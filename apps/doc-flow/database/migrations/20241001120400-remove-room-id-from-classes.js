'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const classes = await queryInterface.sequelize.query(
        'SELECT id, room_id FROM classes WHERE room_id IS NOT NULL',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      await queryInterface.removeColumn('classes', 'room_id');
    } catch (error) {
      console.error('Erro ao remover a coluna room_id de classes:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('classes', 'room_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'rooms',
          key: 'id'
        }
      });
    } catch (error) {
      console.error('Erro ao restaurar a coluna room_id em classes:', error);
      throw error;
    }
  }
}; 
 