from django.core.management.base import BaseCommand
from django.db import transaction
from blog.models import BlogPost
from blog.seo_utils import SEOAnalyzer


class Command(BaseCommand):
    help = 'Analisa e atualiza SEO scores de todos os posts do blog'

    def add_arguments(self, parser):
        parser.add_argument(
            '--update-scores',
            action='store_true',
            help='Atualiza os scores SEO dos posts existentes',
        )
        parser.add_argument(
            '--post-id',
            type=int,
            help='Analisa apenas um post específico',
        )
        parser.add_argument(
            '--generate-missing-seo',
            action='store_true',
            help='Gera campos SEO faltantes automaticamente',
        )

    def handle(self, *args, **options):
        if options['post_id']:
            posts = BlogPost.objects.filter(id=options['post_id'])
        else:
            posts = BlogPost.objects.all()

        self.stdout.write(f"Analisando {posts.count()} post(s)...")

        for post in posts:
            self.analyze_post(post, options)

        self.stdout.write(
            self.style.SUCCESS(f'Análise concluída para {posts.count()} post(s)')
        )

    def analyze_post(self, post, options):
        self.stdout.write(f"\n--- Analisando: {post.title} ---")
        
        # Análise do título
        title_analysis = SEOAnalyzer.analyze_title_seo(post.title)
        self.stdout.write(f"Título ({title_analysis['length']} chars): ", ending='')
        if title_analysis['optimal_length']:
            self.stdout.write(self.style.SUCCESS("✓ Otimizado"))
        elif title_analysis['too_short']:
            self.stdout.write(self.style.WARNING("⚠ Muito curto"))
        elif title_analysis['too_long']:
            self.stdout.write(self.style.ERROR("✗ Muito longo"))
        else:
            self.stdout.write(self.style.WARNING("⚠ Pode melhorar"))

        # Análise da meta descrição
        meta_analysis = SEOAnalyzer.analyze_meta_description(post.meta_description)
        self.stdout.write(f"Meta descrição ({meta_analysis['length']} chars): ", ending='')
        if meta_analysis['optimal_length']:
            self.stdout.write(self.style.SUCCESS("✓ Otimizada"))
        elif not meta_analysis['exists']:
            self.stdout.write(self.style.ERROR("✗ Não existe"))
        elif meta_analysis['too_short']:
            self.stdout.write(self.style.WARNING("⚠ Muito curta"))
        elif meta_analysis['too_long']:
            self.stdout.write(self.style.ERROR("✗ Muito longa"))

        # Análise da palavra-chave
        if post.focus_keyword:
            keyword_analysis = SEOAnalyzer.analyze_keyword_density(post.content, post.focus_keyword)
            self.stdout.write(f"Palavra-chave '{post.focus_keyword}' ({keyword_analysis['density']}%): ", ending='')
            if keyword_analysis['optimal']:
                self.stdout.write(self.style.SUCCESS("✓ Densidade ideal"))
            else:
                self.stdout.write(self.style.WARNING("⚠ Densidade não ideal"))
        else:
            self.stdout.write(self.style.WARNING("⚠ Palavra-chave principal não definida"))

        # Análise da estrutura do conteúdo
        content_analysis = SEOAnalyzer.analyze_content_structure(post.content)
        self.stdout.write(f"Conteúdo ({content_analysis['word_count']} palavras): ", ending='')
        if content_analysis['has_good_structure']:
            self.stdout.write(self.style.SUCCESS("✓ Boa estrutura"))
        else:
            self.stdout.write(self.style.WARNING("⚠ Estrutura pode melhorar"))

        # Verifica campos obrigatórios
        self.check_required_fields(post)

        # Atualiza scores se solicitado
        if options['update_scores']:
            with transaction.atomic():
                old_seo_score = post.seo_score
                old_readability_score = post.readability_score
                
                post.seo_score = post.calculate_seo_score()
                post.readability_score = post.calculate_readability_score()
                post.save(update_fields=['seo_score', 'readability_score'])
                
                self.stdout.write(
                    f"Scores atualizados: SEO {old_seo_score:.1f} → {post.seo_score:.1f}, "
                    f"Legibilidade {old_readability_score:.1f} → {post.readability_score:.1f}"
                )

        # Gera campos SEO faltantes se solicitado
        if options['generate_missing_seo']:
            self.generate_missing_seo_fields(post)

    def check_required_fields(self, post):
        """Verifica campos importantes para SEO"""
        issues = []
        
        if not post.featured_image:
            issues.append("Sem imagem em destaque")
        
        if not post.excerpt:
            issues.append("Sem resumo")
        
        if not post.category:
            issues.append("Sem categoria")
        
        if not post.tags.exists():
            issues.append("Sem tags")
        
        if not post.meta_title:
            issues.append("Sem título SEO")
        
        if not post.og_title:
            issues.append("Sem título Open Graph")
        
        if not post.og_description:
            issues.append("Sem descrição Open Graph")

        if issues:
            self.stdout.write(self.style.WARNING(f"Problemas encontrados: {', '.join(issues)}"))
        else:
            self.stdout.write(self.style.SUCCESS("✓ Todos os campos importantes preenchidos"))

    def generate_missing_seo_fields(self, post):
        """Gera automaticamente campos SEO faltantes"""
        updated_fields = []
        
        with transaction.atomic():
            if not post.meta_title:
                post.meta_title = post.title[:70]
                updated_fields.append('meta_title')
            
            if not post.meta_description and post.excerpt:
                post.meta_description = post.excerpt[:160]
                updated_fields.append('meta_description')
            
            if not post.og_title:
                post.og_title = post.title[:95]
                updated_fields.append('og_title')
            
            if not post.og_description and post.excerpt:
                post.og_description = post.excerpt[:200]
                updated_fields.append('og_description')
            
            if updated_fields:
                post.save(update_fields=updated_fields)
                self.stdout.write(
                    self.style.SUCCESS(f"Campos gerados automaticamente: {', '.join(updated_fields)}")
                )
            else:
                self.stdout.write("Nenhum campo SEO faltante para gerar")
