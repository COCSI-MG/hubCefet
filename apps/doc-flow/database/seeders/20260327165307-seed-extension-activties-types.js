'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		return await queryInterface.sequelize.query(`
      INSERT INTO extension_activities_types (name, description, created_at, updated_at)
      VALUES
        ('Disciplina de Extensão', 'Disciplina de Extensão', NOW(), NOW()),
        ('Instrutor de cursos de extensão', 'Instrutor de cursos de extensão com carga horária, objetivos e conteúdo definidos.', NOW(), NOW()),
        ('Apresentador em eventos', 'Apresentador em eventos similares a workshops, seminários, mostras, jornadas, treinamento, palestra.', NOW(), NOW()),
        ('Membro de projetos externos', 'Membro de projetos/programas de extensão ofertados por outra IES, com ou sem recebimento de bolsas.', NOW(), NOW()),
        ('Projeto de TCC', 'Projeto de TCC com protagonismo extensionista.', NOW(), NOW()),
        ('Membro de projetos do CEFET/RJ', 'Membro de projetos/programas de extensão cadastrados no CEFET/RJ.', NOW(), NOW()),
        ('Organizador de eventos', 'Organizador de eventos similares a workshops, seminários, mostras, jornadas, treinamento, palestra.', NOW(), NOW()),
        ('Participação na organização de eventos', 'Participação na organização de eventos educacionais, culturais, científicos, artísticos ou esportivos.', NOW(), NOW()),
        ('Mediador e/ou debatedor', 'Mediador e/ou debatedor em eventos acadêmicos, científicos, esportivos ou culturais.', NOW(), NOW()),
        ('Trabalhos técnicos ou consultoria', 'Trabalhos técnicos ou consultoria voltados para a comunidade.', NOW(), NOW()),
        ('Prêmios em concursos', 'Prêmios em concursos ou competições como aluno do Curso.', NOW(), NOW()),
        ('Monitoria de disciplinas', 'Monitoria de disciplinas, iniciação à docência.', NOW(), NOW()),
        ('Programa de iniciação científica', 'Participação em programas de iniciação científica de protagonismo extensionista.', NOW(), NOW())
      ON CONFLICT (name) DO UPDATE
      SET
        description = EXCLUDED.description,
        updated_at = NOW();
    `)
	},

	async down(queryInterface, Sequelize) {
		return await queryInterface.bulkDelete('extension_activities_types', null, {})
	},
}
