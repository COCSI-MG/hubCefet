'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.bulkInsert(
      'complementary_activities_types',
      [
        {
          name: 'Disciplina de Extensão',
          description: 'Disciplina de Extensão.',
        },
        {
          name: 'Instrutor de cursos de extensão',
          description:
            'Instrutor de cursos de extensão com carga horária, objetivos e conteúdo definidos.',
        },
        {
          name: 'Apresentador em eventos',
          description:
            'Apresentador em eventos similares a workshops, seminários, mostras, jornadas, treinamento, palestra.',
        },
        {
          name: 'Participação em eventos da UNED Maria da Graça',
          description:
            'Participação como aluno ou ouvinte em eventos específicos da UNED Maria da Graça, como Semana de Extensão e Semana da Informática.',
        },
        {
          name: 'Participação em atividades de extensão externas',
          description:
            'Participação como aluno ou ouvinte de cursos, palestras ou demais atividades de extensão, não ofertadas pela UNED Maria da Graça, com carga horária, objetivos e conteúdo definidos.',
        },
        {
          name: 'Participação em congressos e similares',
          description:
            'Participação em congressos, seminários, conferências, oficinas de trabalhos e/ou similares acadêmicos não contemplados em 5.',
        },
        {
          name: 'Participação em programas de iniciação científica',
          description: 'Participação em programas de iniciação científica.',
        },
        {
          name: 'Participação em projetos de pesquisa',
          description: 'Participação em projetos de pesquisa não contemplados em 7.',
        },
        {
          name: 'Apresentação de trabalhos ou obras',
          description:
            'Apresentação de trabalhos ou obra de arte em congressos, seminários, simpósios, festivais, exposições, mostras, oficinas, feiras e similares, versando sobre temas educacionais, científicos ou culturais.',
        },
        {
          name: 'Publicação de trabalhos',
          description:
            'Publicação de trabalho em periódico, obra coletiva ou autoria de livro (texto integral, vinculado à área de formação e atuação).',
        },
        {
          name: 'Assistir palestras, colóquios e aulas magnas',
          description: 'Assistir palestras, colóquios e aulas magnas.',
        },
        {
          name: 'Estágio não obrigatório',
          description: 'Realização de estágio não obrigatório.',
        },
        {
          name: 'Experiência profissional na área',
          description:
            'Experiência profissional na área, concomitante com o curso.',
        },
        {
          name: 'Participação em programas ou projetos educativos e culturais',
          description:
            'Participação em Programas/Projetos de assistência educativa, cultural, científica, esportiva, artística, desde que não configurem estágio.',
        },
        {
          name: 'Participação em intercâmbio ou convênio cultural',
          description: 'Participação em intercâmbio ou convênio cultural.',
        },
        {
          name: 'Visitação a exposições e acervos',
          description:
            'Visitação a exposições, mostras de arte e cultura, a acervos museológicos e arquivísticos validada por um professor.',
        },
        {
          name: 'Assistir espetáculos',
          description:
            'Assistir espetáculos cênicos, coreográficos, musicais e cinematográficos validados por professor.',
        },
        {
          name: 'Participação em órgão colegiado do CEFET/RJ',
          description: 'Participação em órgão colegiado do CEFET/RJ.',
        },
        {
          name: 'Participação na gestão estudantil',
          description:
            'Participação na gestão de centro acadêmico, diretório acadêmico etc.',
        },
      ],
    )
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete('complementary_activities_types', null, {})
  },
}

