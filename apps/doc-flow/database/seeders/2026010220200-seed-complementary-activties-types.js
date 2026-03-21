'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.sequelize.query(`
      INSERT INTO complementary_activities_types (name, description, created_at, updated_at)
      VALUES
        ('Disciplina de Extensão', 'Disciplina de Extensão.', NOW(), NOW()),
        ('Instrutor de cursos de extensão', 'Instrutor de cursos de extensão com carga horária, objetivos e conteúdo definidos.', NOW(), NOW()),
        ('Apresentador em eventos', 'Apresentador em eventos similares a workshops, seminários, mostras, jornadas, treinamento, palestra.', NOW(), NOW()),
        ('Participação em eventos da UNED Maria da Graça', 'Participação como aluno ou ouvinte em eventos específicos da UNED Maria da Graça, como Semana de Extensão e Semana da Informática.', NOW(), NOW()),
        ('Participação em atividades de extensão externas', 'Participação como aluno ou ouvinte de cursos, palestras ou demais atividades de extensão, não ofertadas pela UNED Maria da Graça, com carga horária, objetivos e conteúdo definidos.', NOW(), NOW()),
        ('Participação em congressos e similares', 'Participação em congressos, seminários, conferências, oficinas de trabalhos e/ou similares acadêmicos não contemplados em 5.', NOW(), NOW()),
        ('Participação em programas de iniciação científica', 'Participação em programas de iniciação científica.', NOW(), NOW()),
        ('Participação em projetos de pesquisa', 'Participação em projetos de pesquisa não contemplados em 7.', NOW(), NOW()),
        ('Apresentação de trabalhos ou obras', 'Apresentação de trabalhos ou obra de arte em congressos, seminários, simpósios, festivais, exposições, mostras, oficinas, feiras e similares, versando sobre temas educacionais, científicos ou culturais.', NOW(), NOW()),
        ('Publicação de trabalhos', 'Publicação de trabalho em periódico, obra coletiva ou autoria de livro (texto integral, vinculado à área de formação e atuação).', NOW(), NOW()),
        ('Assistir palestras, colóquios e aulas magnas', 'Assistir palestras, colóquios e aulas magnas.', NOW(), NOW()),
        ('Estágio não obrigatório', 'Realização de estágio não obrigatório.', NOW(), NOW()),
        ('Experiência profissional na área', 'Experiência profissional na área, concomitante com o curso.', NOW(), NOW()),
        ('Participação em programas ou projetos educativos e culturais', 'Participação em Programas/Projetos de assistência educativa, cultural, científica, esportiva, artística, desde que não configurem estágio.', NOW(), NOW()),
        ('Participação em intercâmbio ou convênio cultural', 'Participação em intercâmbio ou convênio cultural.', NOW(), NOW()),
        ('Visitação a exposições e acervos', 'Visitação a exposições, mostras de arte e cultura, a acervos museológicos e arquivísticos validada por um professor.', NOW(), NOW()),
        ('Assistir espetáculos', 'Assistir espetáculos cênicos, coreográficos, musicais e cinematográficos validados por professor.', NOW(), NOW()),
        ('Participação em órgão colegiado do CEFET/RJ', 'Participação em órgão colegiado do CEFET/RJ.', NOW(), NOW()),
        ('Participação na gestão estudantil', 'Participação na gestão de centro acadêmico, diretório acadêmico etc.', NOW(), NOW())
      ON CONFLICT (name) DO UPDATE
      SET
        description = EXCLUDED.description,
        updated_at = NOW();
    `)
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('complementary_activities_types', null, {})
  },
}
