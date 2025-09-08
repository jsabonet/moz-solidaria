// SEO Configuration for Moz Solidária
export const SEOConfig = {
  site: {
    name: 'Moz Solidária',
    title: 'Moz Solidária - Transformando Vidas em Cabo Delgado',
    description: 'Organização humanitária sem fins lucrativos que atua em Cabo Delgado, Moçambique, promovendo solidariedade, desenvolvimento comunitário e apoio social.',
    url: 'https://mozsolidaria.org',
    logo: '/logo-moz-solidaria-v2.png',
    defaultImage: '/og-default.jpg', // Imagem padrão para Open Graph
    social: {
      facebook: 'https://www.facebook.com/mozsolidaria/',
      instagram: 'https://www.instagram.com/mozsolidaria/?hl=pt-pt',
      twitter: 'https://x.com/mozsolidaria',
      tiktok: 'https://tiktok.com/@mozsolidaria'
    }
  },
  
  // Keywords principais organizadas por categoria
  keywords: {
    primary: [
      'solidariedade em Moçambique',
      'apoio social Cabo Delgado',
      'projetos comunitários',
      'organização humanitária',
      'desenvolvimento social',
      'Moz Solidária'
    ],
    location: [
      'Cabo Delgado',
      'Mocímboa da Praia',
      'Moçambique',
      'África',
      'comunidades rurais'
    ],
    services: [
      'apoio alimentar',
      'educação comunitária',
      'saúde pública',
      'empoderamento feminino',
      'formação profissional',
      'apoio emergencial'
    ],
    impact: [
      'transformação social',
      'dignidade humana',
      'justiça social',
      'desenvolvimento sustentável',
      'reconstrução comunitária'
    ]
  },
  
  // Configurações específicas por página
  pages: {
    home: {
      title: 'Moz Solidária - Transformando Vidas em Cabo Delgado',
      description: 'Organização humanitária sem fins lucrativos que promove solidariedade, desenvolvimento e apoio social às comunidades de Cabo Delgado, Moçambique.',
      keywords: 'solidariedade em Moçambique, apoio social Cabo Delgado, projetos comunitários, organização humanitária, desenvolvimento social',
      priority: '1.0'
    },
    
    sobre: {
      title: 'Sobre Nós - História e Missão da Moz Solidária',
      description: 'Conheça a história, missão e valores da Moz Solidária. Fundada em 2024, atuamos em Cabo Delgado promovendo dignidade humana e desenvolvimento comunitário.',
      keywords: 'sobre Moz Solidária, missão, história, valores, dignidade humana, Cabo Delgado',
      priority: '0.9'
    },
    
    programas: {
      title: 'Programas e Áreas de Atuação - Moz Solidária',
      description: 'Descubra nossos programas de apoio social: educação, saúde, empoderamento feminino, formação profissional e desenvolvimento comunitário em Cabo Delgado.',
      keywords: 'programas sociais, áreas de atuação, educação, saúde, empoderamento feminino, formação profissional, desenvolvimento comunitário',
      priority: '0.9'
    },
    
    blog: {
      title: 'Blog - Notícias e Histórias de Impacto | Moz Solidária',
      description: 'Acompanhe nossas atividades, histórias de impacto e notícias sobre desenvolvimento social e humanitário em Cabo Delgado.',
      keywords: 'blog Moz Solidária, notícias, histórias de impacto, desenvolvimento social, humanitário, Cabo Delgado',
      priority: '0.8'
    },
    
    contacto: {
      title: 'Contacto - Entre em Contacto com a Moz Solidária',
      description: 'Entre em contacto conosco. Endereço, telefone, email e redes sociais da Moz Solidária em Mocímboa da Praia, Cabo Delgado.',
      keywords: 'contacto Moz Solidária, endereço, telefone, email, Mocímboa da Praia, Cabo Delgado',
      priority: '0.7'
    },
    
    doacao: {
      title: 'Faça uma Doação - Apoie Nossos Projetos Sociais',
      description: 'Faça uma doação e apoie nossos projetos de desenvolvimento social em Cabo Delgado. Sua contribuição transforma vidas e fortalece comunidades.',
      keywords: 'doação, apoio social, contribuição, projetos sociais, transformação social, Cabo Delgado',
      priority: '0.8'
    },
    
    transparencia: {
      title: 'Transparência - Prestação de Contas | Moz Solidária',
      description: 'Conheça nossa política de transparência, prestação de contas e como utilizamos os recursos para maximizar o impacto social.',
      keywords: 'transparência, prestação de contas, responsabilidade, recursos, impacto social',
      priority: '0.6'
    }
  }
};
