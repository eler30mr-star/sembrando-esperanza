export const plans = [
  {
    slug: 'plan-biblia-30-dias',
    title: 'Plan Bíblico 30 días',
    description: 'Lectura diaria de la Biblia para fortalecer tu fe con dirección espiritual. Texto sagrado y reflexiones.',
    image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?auto=format&fit=crop&w=1200&q=80',
    category: 'Lectura',
    duration: '30 días',
    readingTime: '15 min'
  },
  {
    slug: 'plan-salmos-meditacion',
    title: 'Salmos para la meditación',
    description: 'Sumérgete en los Salmos, oraciones y reflexiones que hablan al corazón. Paz y esperanza en cada verso.',
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80',
    category: 'Meditación',
    duration: '21 días',
    readingTime: '10 min'
  },
  {
    slug: 'plan-evangelios',
    title: 'Los Evangelios paso a paso',
    description: 'Conoce la vida de Jesús a través de Mateo, Marcos, Lucas y Juan. Un viaje por el corazón del cristianismo.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    category: 'Estudio',
    duration: '40 días',
    readingTime: '20 min'
  },
  {
    slug: 'plan-promesas-dios',
    title: 'Promesas de Dios',
    description: 'Descubre las promesas divinas que transformarán tu vida. Esperanza, fortaleza y fe en cada pasaje.',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80',
    category: 'Reflexión',
    duration: '21 días',
    readingTime: '12 min'
  }
];

export const stories = [
  {
    slug: 'historia-fe-imposible',
    title: 'Fe en lo imposible',
    description: 'La historia de cómo la fe transformó una vida al borde del abismo. Un testimonio de esperanza.',
    image: 'https://images.unsplash.com/photo-1500595046891-9c50e7df1849?auto=format&fit=crop&w=1200&q=80',
    category: 'Testimonios',
    readingTime: '12 min',
    status: 'published',
    updatedAtMs: Date.now(),
    chapters: [
      {
        title: 'El inicio del viaje',
        content: 'En un día oscuro, todo parecía perdido. Pero una voz pequeña susurraba esperanza...'
      },
      {
        title: 'El encuentro',
        content: 'Fue en ese momento cuando la fe llegó, no como respuesta, sino como compañía en la tormenta.'
      },
      {
        title: 'La transformación',
        content: 'Lo que parecía imposible se hizo realidad. No porque desaparecieron los problemas, sino porque aprendí a verlos con ojos de fe.'
      }
    ]
  },
  {
    slug: 'reflexion-perdon',
    title: 'El poder del perdón',
    description: 'Reflexión profunda sobre cómo el perdón libera el alma y abre puertas a nuevas bendiciones.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
    category: 'Reflexiones',
    readingTime: '8 min',
    status: 'published',
    updatedAtMs: Date.now() - 86400000,
    chapters: [
      {
        title: 'Cadenas invisibles',
        content: 'El resentimiento es un peso que cargamos sin necesidad. Cada día que no perdonamos, nos alejamos más de la paz.'
      },
      {
        title: 'El acto de soltar',
        content: 'Perdonar no significa olvidar o justificar. Significa elegir la libertad sobre el dolor.'
      }
    ]
  },
  {
    slug: 'historia-sanidad',
    title: 'Sanidad del alma',
    description: 'Un relato de cómo Dios restaura lo quebrantado y sana las heridas más profundas del corazón.',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80',
    category: 'Testimonios',
    readingTime: '15 min',
    status: 'published',
    updatedAtMs: Date.now() - 172800000,
    chapters: [
      {
        title: 'Las heridas ocultas',
        content: 'Sonreía ante el mundo, pero adentro gritaba de dolor. Las heridas del pasado no se veían, pero estaban ahí.'
      },
      {
        title: 'El camino de sanidad',
        content: 'Fue un proceso lento, pero cada día Dios traía luz a los rincones oscuros de mi corazón.'
      }
    ]
  },
  {
    slug: 'devocional-madrugada',
    title: 'Devocional matutino',
    description: 'Comienza tu día conectado con Dios. Reflexiones breves para fortalecer tu espíritu cada mañana.',
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80',
    category: 'Devocionales',
    readingTime: '5 min',
    status: 'published',
    updatedAtMs: Date.now() - 259200000,
    chapters: [
      {
        title: 'El amanecer',
        content: 'Cada nuevo día es una oportunidad de empezar de nuevo. Dios nunca se cansa de darnos oportunidades.'
      }
    ]
  }
];

export const verses = [
  {
    reference: 'Juan 3:16',
    text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
    theme: 'Amor de Dios'
  },
  {
    reference: 'Filipenses 4:13',
    text: 'Todo lo puedo en Cristo que me fortalece.',
    theme: 'Fortaleza'
  },
  {
    reference: 'Proverbios 3:5-6',
    text: 'Fíate de Jehová de todo tu corazón, Y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, Y él enderezará tus veredas.',
    theme: 'Confianza'
  },
  {
    reference: 'Salmos 23:1',
    text: 'Jehová es mi pastor; nada me faltará.',
    theme: 'Provisión'
  },
  {
    reference: 'Romanos 8:28',
    text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
    theme: 'Propósito'
  },
  {
    reference: 'Mateo 11:28',
    text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',
    theme: 'Descanso'
  },
  {
    reference: 'Jeremías 29:11',
    text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros fin y esperanza.',
    theme: 'Esperanza'
  },
  {
    reference: 'Isaías 40:31',
    text: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.',
    theme: 'Resistencia'
  }
];

export const albums = [
  {
    slug: 'album-naturaleza',
    title: 'Obras de Dios en la naturaleza',
    description: 'Fotografías que revelan la grandeza divina a través de paisajes, sunsets y maravillas naturales.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    count: 24,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    slug: 'album-esperanza',
    title: 'Símbolos de esperanza',
    description: 'Imágenes inspiradoras que refuerzan fe, amor y esperanza. Colecciones para meditar.',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80',
    count: 18,
    images: [
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1500595046891-9c50e7df1849?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    slug: 'album-fe',
    title: 'Fe en acción',
    description: 'Momentos de iglesia, comunidad y ministerio. La fe vivida en comunidad.',
    image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?auto=format&fit=crop&w=1200&q=80',
    count: 15,
    images: [
      'https://images.unsplash.com/photo-1507842217343-583f20270319?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80'
    ]
  }
];

export const videos = [
  {
    slug: 'video-predicacion-esperanza',
    title: 'Predicación: La esperanza que no falla',
    description: 'Un mensaje poderoso sobre cómo la esperanza en Dios nos sostiene en tiempos difíciles.',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Predicaciones',
    duration: '45 min'
  },
  {
    slug: 'video-musica-adoracion',
    title: 'Música de adoración cristiana',
    description: 'Compilación de canciones que elevan el espíritu y conectan con Dios a través de la música.',
    thumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Música',
    duration: '60 min'
  },
  {
    slug: 'video-testimonio',
    title: 'Testimonio de transformación',
    description: 'Una historia real de cómo Dios cambió una vida completamente. Inspirador y motivador.',
    thumbnail: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Testimonios',
    duration: '25 min'
  },
  {
    slug: 'video-biblia-resumida',
    title: 'La Biblia en 10 minutos',
    description: 'Un resumen rápido de los libros más importantes de la Biblia. Perfecto para principiantes.',
    thumbnail: 'https://images.unsplash.com/photo-1507842217343-583f20270319?auto=format&fit=crop&w=1200&q=80',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Educativo',
    duration: '10 min'
  }
];

export const prayers = [
  {
    slug: 'oracion-fe',
    title: 'Oración de fe y confianza',
    text: 'Señor, en este día te entrego todas mis preocupaciones. Fortalece mi fe y ayúdame a confiar en tu plan perfecto. Que tu paz inunde mi corazón y guíe cada paso que doy. En el nombre de Jesús, amén.'
  },
  {
    slug: 'oracion-sanidad',
    title: 'Oración por sanidad',
    text: 'Dios mío, vengo ante ti buscando tu toque sanador. Sana mi cuerpo, mi mente y mi espíritu. Que tu poder restaurador actúe en mí y en todos los que sufren. Te entrego mis miedos y recibo tu paz. Amén.'
  },
  {
    slug: 'oracion-proteccion',
    title: 'Oración de protección',
    text: 'Padre celestial, te pido que cubras a mi familia y a mis seres queridos con tu protección divina. Guarda nuestros caminos, protege nuestros corazones y aleja todo lo que nos quiera hacer daño. Gracias por tu cuidado constante. Amén.'
  },
  {
    slug: 'oracion-gratitud',
    title: 'Oración de gratitud',
    text: 'Te doy gracias, Señor, por todas tus bendiciones en mi vida. Por la familia, los amigos, las oportunidades y cada momento vivido. Ayúdame a ser siempre agradecido y a ver tu mano bondadosa en todas las cosas. Amén.'
  },
  {
    slug: 'oracion-sabiduria',
    title: 'Oración pidiendo sabiduría',
    text: 'Espíritu Santo, dame sabiduría para tomar buenas decisiones. Ilumina mi mente y guía mis pasos hacia lo correcto. Ayúdame a distinguir entre lo temporal y lo eterno, y a elegir siempre lo que te glorifica. Amén.'
  },
  {
    slug: 'oracion-perdón',
    title: 'Oración pidiendo perdón',
    text: 'Padre, reconozco mis faltas y me arrepiento. Pido perdón por mis errores y la forma en que he fallado. Limpiar mi corazón de rencor y ayúdame a perdonarme a mí mismo como Tú ya lo has hecho. Gracias por tu misericordia infinita. Amén.'
  }
];
