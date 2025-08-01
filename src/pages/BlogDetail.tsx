import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowLeft, Share2, Heart, MessageCircle, ArrowRight, Clock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { fetchPostDetail, fetchPosts } from "@/lib/api";

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!slug) {
        console.warn("BlogDetail: slug não encontrado na URL.");
        return;
      }
      
      try {
        setLoading(true);
        console.log("BlogDetail: Buscando post detail para slug:", slug);
        
        const [postData, postsData] = await Promise.all([
          fetchPostDetail(slug),
          fetchPosts()
        ]);
        
        console.log("BlogDetail: postData recebido:", postData);
        console.log("BlogDetail: postsData recebido:", postsData);

        // Verificar se o post existe e está publicado
        if (!postData || Object.keys(postData).length === 0) {
          console.warn("BlogDetail: postData vazio ou nulo.", postData);
          setError("Artigo não encontrado.");
          setPost(null);
        } else if (postData.status !== 'published' && !postData.is_published) {
          // Se o post não estiver publicado, mostrar erro 404
          console.warn("BlogDetail: Post não publicado:", postData.status);
          setError("Artigo não encontrado.");
          setPost(null);
        } else {
          setPost(postData);
        }
        
        // Garantir que postsData é um array e filtrar apenas posts publicados
        const posts = Array.isArray(postsData) ? postsData : postsData.results || [];
        console.log("BlogDetail: posts para relacionados:", posts);
        
        const publishedPosts = posts.filter(p => 
          p.status === 'published' || p.is_published === true
        );
        
        const related = publishedPosts
          .filter((p: any) => p.slug !== slug)
          .slice(0, 3);
        setRelatedPosts(related);
        
      } catch (err: any) {
        console.error('BlogDetail: Erro detalhado no BlogDetail:', err);
        setError("Erro ao carregar o artigo");
        setPost(null);
      } finally {
        setLoading(false);
        console.log("BlogDetail: loading finalizado. post:", post, "error:", error);
      }
    }
    
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <span>Carregando artigo...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-500">Artigo não encontrado</h1>
          <p className="text-muted-foreground mt-4">{error || "O artigo que você procura não existe."}</p>
          <Link to="/blog">
            <Button className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Dados dos artigos do blog (normalmente viriam de uma API)
  const blogPosts = [
    {
      id: 1,
      title: "Transformando Vidas através da Educação em Cabo Delgado",
      content: `
        <p>A educação é a ferramenta mais poderosa que temos para transformar vidas e comunidades. Em Cabo Delgado, onde muitas famílias foram deslocadas por conflitos, a necessidade de programas educacionais adaptados às circunstâncias locais tornou-se ainda mais urgente.</p>

        <h2>O Desafio da Educação em Tempos de Crise</h2>
        <p>Quando iniciamos nossos programas de alfabetização, encontramos uma realidade complexa: crianças que nunca haviam frequentado uma escola, adultos que perderam a oportunidade de aprender a ler e escrever, e famílias inteiras vivendo em campos de deslocados sem acesso a qualquer tipo de educação formal.</p>

        <p>A situação exigia uma abordagem inovadora. Não podíamos simplesmente replicar o modelo tradicional de ensino - precisávamos criar algo novo, adaptado às necessidades específicas dessas comunidades.</p>

        <h2>Metodologia Adaptada</h2>
        <p>Desenvolvemos um programa de alfabetização que funciona em três níveis:</p>
        
        <ul>
          <li><strong>Alfabetização Infantil:</strong> Aulas lúdicas para crianças de 6 a 12 anos, focadas em português e matemática básica</li>
          <li><strong>Educação de Jovens:</strong> Programas acelerados para adolescentes que perderam anos de escolaridade</li>
          <li><strong>Alfabetização de Adultos:</strong> Aulas noturnas para pais e mães que querem aprender a ler e escrever</li>
        </ul>

        <h2>Resultados Transformadores</h2>
        <p>Nos últimos 12 meses, conseguimos alfabetizar mais de 250 pessoas em nossas comunidades parceiras. Mas os números só contam parte da história. O que realmente importa são as transformações que vemos todos os dias:</p>

        <blockquote>
          "Agora posso ler as cartas que meu filho me manda de Maputo. Antes dependia de outros para saber notícias da minha família."
          <cite>- Maria Joaquina, 45 anos, participante do programa de alfabetização</cite>
        </blockquote>

        <h2>O Futuro da Educação em Cabo Delgado</h2>
        <p>Nosso trabalho está apenas começando. Para 2024, planejamos expandir nossos programas para alcançar mais 500 pessoas, incluindo a criação de uma biblioteca comunitária móvel que levará livros e recursos educacionais às aldeias mais remotas.</p>

        <p>Acreditamos que cada pessoa que aprende a ler e escrever não apenas transforma sua própria vida, mas também se torna um agente de mudança em sua comunidade. É assim que construímos um futuro melhor para Cabo Delgado: uma pessoa, uma família, uma comunidade de cada vez.</p>
      `,
      excerpt: "Descubra como nossos programas de alfabetização estão criando oportunidades reais para crianças e adultos em comunidades rurais.",
      author: "Maria Santos",
      authorBio: "Diretora Executiva da MOZ SOLIDÁRIA com 10 anos de experiência em desenvolvimento comunitário.",
      date: "15 de Janeiro, 2024",
      category: "Educação",
      readTime: "5 min",
      featured: true,
      image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      tags: ["Educação", "Alfabetização", "Cabo Delgado", "Transformação Social"]
    },
    {
      id: 2,
      title: "Projeto de Agricultura Sustentável: Resultados do Primeiro Semestre",
      content: `
        <p>O primeiro semestre de 2024 marcou um momento histórico para nosso programa de agricultura sustentável em Cabo Delgado. Com o apoio de agricultores locais e técnicos especializados, conseguimos implementar técnicas inovadoras que estão transformando a produção agrícola na região.</p>

        <h2>Desafios Iniciais</h2>
        <p>Quando iniciamos o projeto, enfrentamos diversos desafios: solos degradados pela seca, falta de sementes resistentes e conhecimento limitado sobre técnicas sustentáveis. Muitas famílias haviam perdido suas terras devido aos conflitos e precisavam recomeçar do zero.</p>

        <h2>Técnicas Implementadas</h2>
        <p>Introduzimos várias práticas sustentáveis:</p>
        
        <ul>
          <li><strong>Compostagem:</strong> Aproveitamento de resíduos orgânicos para fertilizar o solo</li>
          <li><strong>Rotação de Culturas:</strong> Preservação da fertilidade do solo</li>
          <li><strong>Sementes Resistentes:</strong> Variedades adaptadas ao clima local</li>
          <li><strong>Sistemas de Irrigação:</strong> Uso eficiente da água disponível</li>
        </ul>

        <h2>Resultados Alcançados</h2>
        <p>Os resultados superaram nossas expectativas. A produtividade aumentou em média 60% nas propriedades participantes do programa. Além disso, 85% das famílias relataram melhoria na segurança alimentar.</p>

        <blockquote>
          "Minha colheita de milho nunca foi tão boa. As técnicas que aprendi me ajudaram a produzir alimento suficiente para minha família e ainda sobra para vender no mercado."
          <cite>- António Muianga, agricultor de Chiure</cite>
        </blockquote>

        <h2>Próximos Passos</h2>
        <p>Para o segundo semestre, planejamos expandir o programa para mais 150 famílias e introduzir culturas de valor comercial como hortaliças e frutas tropicais.</p>
      `,
      excerpt: "Conheça os impactos positivos das nossas iniciativas de desenvolvimento rural e agricultura sustentável nas comunidades locais.",
      author: "João Mabunda",
      authorBio: "Coordenador de Programas e especialista em agricultura sustentável e desenvolvimento rural.",
      date: "8 de Janeiro, 2024",
      category: "Desenvolvimento Rural",
      readTime: "7 min",
      featured: false,
      image: "https://images.unsplash.com/photo-1486328228599-85db4443971f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      tags: ["Agricultura", "Sustentabilidade", "Desenvolvimento Rural", "Segurança Alimentar"]
    },
    {
      id: 3,
      title: "Empoderamento Feminino: Histórias de Sucesso",
      content: `
        <p>O empoderamento feminino é uma das nossas prioridades na MOZ SOLIDÁRIA. Acreditamos que quando investimos em mulheres, investimos no futuro de toda a comunidade. Neste artigo, compartilhamos algumas das histórias inspiradoras que testemunhamos ao longo do nosso trabalho em Cabo Delgado.</p>

        <h2>O Contexto das Mulheres em Cabo Delgado</h2>
        <p>Em muitas comunidades rurais de Cabo Delgado, as mulheres enfrentam desafios únicos: acesso limitado à educação, dependência econômica, responsabilidades domésticas e cuidado dos filhos. Os conflitos na região agravaram essa situação, deixando muitas mulheres como chefes de família sem os recursos necessários para sustentarem suas famílias.</p>

        <h2>Programas de Capacitação</h2>
        <p>Desenvolvemos programas específicos focados no empoderamento feminino:</p>
        
        <ul>
          <li><strong>Alfabetização de Mulheres:</strong> Aulas específicas para mães e mulheres adultas</li>
          <li><strong>Capacitação Profissional:</strong> Cursos de costura, culinária e artesanato</li>
          <li><strong>Educação Financeira:</strong> Gestão de pequenos negócios e poupança</li>
          <li><strong>Cooperativas Femininas:</strong> Grupos de apoio mútuo e desenvolvimento econômico</li>
        </ul>

        <h2>Histórias de Transformação</h2>
        <p>Nas nossas comunidades parceiras, acompanhamos transformações extraordinárias:</p>

        <blockquote>
          "Antes eu dependia totalmente do meu marido. Agora tenho meu próprio negócio de costura e posso contribuir para as despesas da casa. Meus filhos me veem de forma diferente."
          <cite>- Amina Assane, 32 anos, Pemba</cite>
        </blockquote>

        <blockquote>
          "O grupo de mulheres mudou minha vida. Aprendi a ler, a fazer contas e agora ajudo outras mulheres da minha aldeia."
          <cite>- Fatima Momade, 28 anos, Montepuez</cite>
        </blockquote>

        <h2>Impacto nas Comunidades</h2>
        <p>O empoderamento das mulheres tem um efeito multiplicador. Quando uma mulher prospera, toda a família e comunidade se beneficiam. Observamos melhorias na educação das crianças, na saúde familiar e na coesão social.</p>

        <h2>Metas para 2024</h2>
        <p>Para este ano, planejamos formar mais 200 mulheres em diferentes habilidades profissionais e apoiar a criação de 10 novas cooperativas femininas em diferentes distritos de Cabo Delgado.</p>
      `,
      excerpt: "Mulheres de Cabo Delgado compartilham suas experiências de transformação através dos nossos programas de capacitação.",
      author: "Ana Mussa",
      authorBio: "Responsável de Comunicação e jornalista com foco em questões sociais e desenvolvimento humano.",
      date: "2 de Janeiro, 2024",
      category: "Empoderamento",
      readTime: "6 min",
      featured: false,
      image: "https://images.unsplash.com/photo-1696483150935-2f719f1dfa6a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      tags: ["Empoderamento Feminino", "Capacitação", "Desenvolvimento Econômico", "Cooperativas"]
    },
    {
      id: 4,
      title: "Campanha de Saúde Preventiva: 1000 Famílias Atendidas",
      content: `
        <p>Nossa campanha de saúde preventiva de 2024 foi um marco na história da MOZ SOLIDÁRIA. Em parceria com o Ministério da Saúde e organizações internacionais, conseguimos levar cuidados médicos básicos a mais de 1000 famílias em comunidades remotas de Cabo Delgado.</p>

        <h2>Desafios da Saúde Rural</h2>
        <p>O acesso a serviços de saúde em áreas rurais de Cabo Delgado é extremamente limitado. Muitas comunidades estão a horas de caminhada da unidade sanitária mais próxima, e a falta de transporte torna o acesso ainda mais difícil, especialmente durante a época chuvosa.</p>

        <h2>Estratégia da Campanha</h2>
        <p>Nossa abordagem foi multifacetada:</p>
        
        <ul>
          <li><strong>Brigadas Móveis:</strong> Equipes médicas que visitam comunidades remotas</li>
          <li><strong>Vacinação:</strong> Imunização contra doenças preveníveis</li>
          <li><strong>Educação em Saúde:</strong> Palestras sobre higiene e prevenção</li>
          <li><strong>Distribuição de Materiais:</strong> Kits de primeiros socorros e materiais educativos</li>
        </ul>

        <h2>Resultados Alcançados</h2>
        <p>Durante três meses de campanha intensiva, conseguimos:</p>
        <ul>
          <li>Atender 1.247 famílias em 15 comunidades diferentes</li>
          <li>Vacinar 580 crianças contra doenças preveníveis</li>
          <li>Realizar 320 consultas médicas</li>
          <li>Distribuir 1.000 kits de higiene básica</li>
          <li>Formar 45 agentes comunitários de saúde</li>
        </ul>

        <blockquote>
          "Pela primeira vez em anos, meu filho foi vacinado. A equipe da MOZ SOLIDÁRIA trouxe esperança para nossa comunidade."
          <cite>- Isabel Nambiela, mãe de 3 filhos, Macomia</cite>
        </blockquote>

        <h2>Formação de Agentes Comunitários</h2>
        <p>Um dos aspectos mais importantes da nossa campanha foi a formação de agentes comunitários de saúde. Estas pessoas, escolhidas pelas próprias comunidades, receberam treinamento básico para identificar problemas de saúde e prestar primeiros socorros.</p>

        <h2>Sustentabilidade</h2>
        <p>Para garantir a continuidade dos cuidados de saúde, estabelecemos parcerias com unidades sanitárias locais e criamos um sistema de referência que permite aos agentes comunitários encaminharem casos mais complexos.</p>
      `,
      excerpt: "Relatório completo da nossa campanha de vacinação e educação em saúde que beneficiou mais de 1000 famílias.",
      author: "Dr. Carlos Nhamirre",
      authorBio: "Coordenador de Saúde e médico com especialização em saúde pública e medicina preventiva.",
      date: "28 de Dezembro, 2023",
      category: "Saúde",
      readTime: "4 min",
      featured: false,
      image: "https://images.unsplash.com/photo-1666887360933-ad2ade9ae994?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      tags: ["Saúde Preventiva", "Vacinação", "Medicina Comunitária", "Brigadas Móveis"]
    }
  ];


  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando artigo...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold text-muted-foreground mb-4">{error}</h1>
          <Link to="/blog">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold text-muted-foreground">Artigo não encontrado</h1>
          <Link to="/blog">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Breadcrumb e botão voltar */}
      <section className="bg-muted/30 py-6">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Início</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-primary">Blog</Link>
              <span>/</span>
              <span className="text-foreground">{post.title}</span>
            </div>
            <Link to="/blog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Blog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero do artigo */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Categoria e data */}
            <div className="flex items-center space-x-4 mb-6">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {post.category?.name || 'Sem categoria'}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {post.read_time && post.read_time > 0 
                      ? `${post.read_time} min de leitura`
                      : '5 min de leitura'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {post.title}
            </h1>

            {/* Autor e ações */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                  {(post.author?.username || post.author?.full_name || 'A').split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold">{post.author?.username || post.author?.full_name || 'Autor'}</div>
                  <div className="text-sm text-muted-foreground">Autor</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  Curtir
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartilhar
                </Button>
              </div>
            </div>

            {/* Imagem principal */}
            {post.featured_image && (
              <div className="mb-8">
                <img 
                  src={post.featured_image} 
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Conteúdo do artigo */}
            <article className="prose prose-lg max-w-none mb-12">
              <div 
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="space-y-6 text-foreground leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-foreground [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-foreground [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:my-4 [&>ul>li]:mb-2 [&>ul>li]:ml-6 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:bg-muted/30 [&>blockquote]:py-4 [&>blockquote]:my-6 [&>blockquote>cite]:block [&>blockquote>cite]:mt-2 [&>blockquote>cite]:text-sm [&>blockquote>cite]:text-muted-foreground [&>blockquote>cite]:not-italic"
              />
            </article>

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Categoria</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {post.category?.name || 'Sem categoria'}
                </Badge>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Ações do artigo */}
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Curtir artigo
                </Button>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comentários
                </Button>
              </div>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Artigos relacionados - Apenas posts publicados */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Artigos Relacionados</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts
                .filter(relatedPost => relatedPost.status === 'published' || relatedPost.is_published === true)
                .map((relatedPost) => (
                <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {relatedPost.featured_image && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={relatedPost.featured_image} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {relatedPost.category?.name || 'Sem categoria'}
                    </Badge>
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {relatedPost.excerpt || relatedPost.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{relatedPost.author?.username || relatedPost.author?.full_name || 'Autor'}</span>
                      </div>
                      <span>
                        {relatedPost.read_time && relatedPost.read_time > 0 
                          ? `${relatedPost.read_time} min de leitura`
                          : '5 min de leitura'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(relatedPost.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <Link to={`/blog/${relatedPost.slug}`}>
                        <Button variant="ghost" size="sm">
                          Ler mais
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Mensagem se não houver posts relacionados publicados */}
            {relatedPosts.filter(p => p.status === 'published' || p.is_published === true).length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum artigo relacionado encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Newsletter */}
      <section className="py-16 bg-gradient-to-r from-solidarity-orange to-solidarity-warm text-white">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Não Perca Nenhuma História
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Inscreva-se em nossa newsletter e receba as últimas notícias e histórias de impacto da MOZ SOLIDÁRIA
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input 
              type="email"
              placeholder="Seu email" 
              className="flex-1 px-4 py-2 rounded-md text-foreground"
            />
            <Button className="bg-white text-solidarity-orange hover:bg-white/90 px-6">
              Inscrever
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogDetail;
