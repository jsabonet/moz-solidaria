from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.db.models import Count
from blog.models import Comment, BlogPost


def simple_table(data, headers):
    """Função simples para criar tabelas sem dependências externas"""
    if not data:
        return ""
    
    # Calcular larguras das colunas
    col_widths = []
    for i, header in enumerate(headers):
        max_width = len(str(header))
        for row in data:
            if i < len(row):
                max_width = max(max_width, len(str(row[i])))
        col_widths.append(min(max_width, 50))  # Limite máximo de 50 chars
    
    # Criar separador
    separator = "+" + "+".join(["-" * (w + 2) for w in col_widths]) + "+"
    
    # Criar header
    header_row = "|"
    for i, header in enumerate(headers):
        header_row += f" {str(header):<{col_widths[i]}} |"
    
    # Criar linhas de dados
    rows = []
    for row in data:
        row_str = "|"
        for i, cell in enumerate(row):
            if i < len(col_widths):
                cell_str = str(cell)[:col_widths[i]]  # Truncar se muito longo
                row_str += f" {cell_str:<{col_widths[i]}} |"
        rows.append(row_str)
    
    return "\n".join([separator, header_row, separator] + rows + [separator])


class Command(BaseCommand):
    help = 'Ferramenta de moderação de comentários via linha de comando'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=['list', 'pending', 'approve', 'reject', 'delete', 'stats'],
            help='Ação a ser executada'
        )
        parser.add_argument(
            '--comment-id',
            type=int,
            help='ID do comentário para ações específicas'
        )
        parser.add_argument(
            '--post-slug',
            type=str,
            help='Slug do post para filtrar comentários'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=20,
            help='Limite de resultados (padrão: 20)'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Aplicar ação a todos os comentários pendentes'
        )

    def handle(self, *args, **options):
        action = options['action']
        
        if action == 'list':
            self.list_comments(options)
        elif action == 'pending':
            self.list_pending_comments(options)
        elif action == 'approve':
            self.approve_comment(options)
        elif action == 'reject':
            self.reject_comment(options)
        elif action == 'delete':
            self.delete_comment(options)
        elif action == 'stats':
            self.show_stats()

    def list_comments(self, options):
        """Lista todos os comentários"""
        queryset = Comment.objects.all()
        
        if options['post_slug']:
            try:
                post = BlogPost.objects.get(slug=options['post_slug'])
                queryset = queryset.filter(post=post)
                self.stdout.write(f"\n📝 Comentários do post: {post.title}\n")
            except BlogPost.DoesNotExist:
                raise CommandError(f"Post com slug '{options['post_slug']}' não encontrado")
        else:
            self.stdout.write("\n📝 Todos os comentários:\n")
        
        comments = queryset.select_related('post', 'author').order_by('-created_at')[:options['limit']]
        
        if not comments:
            self.stdout.write(self.style.WARNING("Nenhum comentário encontrado."))
            return
        
        data = []
        for comment in comments:
            status = "✅ Aprovado" if comment.is_approved else "⏳ Pendente"
            author = comment.author.username if comment.author else comment.author_name
            
            data.append([
                comment.id,
                author,
                comment.post.title[:30] + "..." if len(comment.post.title) > 30 else comment.post.title,
                comment.content[:50] + "..." if len(comment.content) > 50 else comment.content,
                status,
                comment.created_at.strftime('%d/%m/%Y %H:%M')
            ])
        
        headers = ["ID", "Autor", "Post", "Conteúdo", "Status", "Data"]
        self.stdout.write(simple_table(data, headers))

    def list_pending_comments(self, options):
        """Lista apenas comentários pendentes"""
        comments = Comment.objects.filter(is_approved=False).select_related('post', 'author').order_by('-created_at')[:options['limit']]
        
        if not comments:
            self.stdout.write(self.style.SUCCESS("🎉 Não há comentários pendentes!"))
            return
        
        self.stdout.write(f"\n⏳ Comentários pendentes de aprovação ({comments.count()}):\n")
        
        data = []
        for comment in comments:
            author = comment.author.username if comment.author else f"{comment.author_name} ({comment.author_email})"
            
            data.append([
                comment.id,
                author,
                comment.post.title[:30] + "..." if len(comment.post.title) > 30 else comment.post.title,
                comment.content[:80] + "..." if len(comment.content) > 80 else comment.content,
                comment.created_at.strftime('%d/%m/%Y %H:%M')
            ])
        
        headers = ["ID", "Autor", "Post", "Conteúdo", "Data"]
        self.stdout.write(simple_table(data, headers))
        
        self.stdout.write(f"\n💡 Para aprovar: python manage.py moderate_comments approve --comment-id <ID>")
        self.stdout.write(f"💡 Para rejeitar: python manage.py moderate_comments reject --comment-id <ID>")

    def approve_comment(self, options):
        """Aprova um ou todos os comentários pendentes"""
        if options['all']:
            count = Comment.objects.filter(is_approved=False).update(
                is_approved=True, 
                updated_at=timezone.now()
            )
            self.stdout.write(
                self.style.SUCCESS(f"✅ {count} comentário(s) aprovado(s) com sucesso!")
            )
        elif options['comment_id']:
            try:
                comment = Comment.objects.get(id=options['comment_id'])
                comment.is_approved = True
                comment.updated_at = timezone.now()
                comment.save()
                
                author = comment.author.username if comment.author else comment.author_name
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Comentário #{comment.id} de '{author}' aprovado!")
                )
                self.stdout.write(f"   Post: {comment.post.title}")
                self.stdout.write(f"   Conteúdo: {comment.content[:100]}...")
                
            except Comment.DoesNotExist:
                raise CommandError(f"Comentário com ID {options['comment_id']} não encontrado")
        else:
            raise CommandError("Especifique --comment-id ou --all")

    def reject_comment(self, options):
        """Rejeita um comentário"""
        if not options['comment_id']:
            raise CommandError("Especifique --comment-id")
        
        try:
            comment = Comment.objects.get(id=options['comment_id'])
            comment.is_approved = False
            comment.updated_at = timezone.now()
            comment.save()
            
            author = comment.author.username if comment.author else comment.author_name
            self.stdout.write(
                self.style.WARNING(f"❌ Comentário #{comment.id} de '{author}' rejeitado.")
            )
            
        except Comment.DoesNotExist:
            raise CommandError(f"Comentário com ID {options['comment_id']} não encontrado")

    def delete_comment(self, options):
        """Exclui um comentário permanentemente"""
        if not options['comment_id']:
            raise CommandError("Especifique --comment-id")
        
        try:
            comment = Comment.objects.get(id=options['comment_id'])
            author = comment.author.username if comment.author else comment.author_name
            post_title = comment.post.title
            
            # Confirmar exclusão
            confirm = input(f"⚠️  Tem certeza que deseja excluir permanentemente o comentário #{comment.id} de '{author}' no post '{post_title}'? [y/N]: ")
            
            if confirm.lower() in ['y', 'yes', 's', 'sim']:
                comment.delete()
                self.stdout.write(
                    self.style.ERROR(f"🗑️  Comentário #{comment.id} excluído permanentemente.")
                )
            else:
                self.stdout.write("Operação cancelada.")
                
        except Comment.DoesNotExist:
            raise CommandError(f"Comentário com ID {options['comment_id']} não encontrado")

    def show_stats(self):
        """Mostra estatísticas dos comentários"""
        from blog.models import Like, Share
        
        total_comments = Comment.objects.count()
        pending_comments = Comment.objects.filter(is_approved=False).count()
        approved_comments = Comment.objects.filter(is_approved=True).count()
        recent_comments = Comment.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()
        
        # Posts com mais comentários
        top_posts = Comment.objects.values(
            'post__title', 'post__slug'
        ).annotate(
            comments_count=Count('id')
        ).order_by('-comments_count')[:5]
        
        # Outras estatísticas sociais
        total_likes = Like.objects.count()
        total_shares = Share.objects.count()
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("📊 ESTATÍSTICAS DE INTERAÇÕES SOCIAIS"))
        self.stdout.write("="*60)
        
        # Comentários
        self.stdout.write(f"\n💬 COMENTÁRIOS:")
        self.stdout.write(f"   Total: {total_comments}")
        self.stdout.write(f"   ⏳ Pendentes: {pending_comments}")
        self.stdout.write(f"   ✅ Aprovados: {approved_comments}")
        self.stdout.write(f"   📅 Últimos 7 dias: {recent_comments}")
        
        # Outras interações
        self.stdout.write(f"\n❤️  CURTIDAS: {total_likes}")
        self.stdout.write(f"📤 COMPARTILHAMENTOS: {total_shares}")
        self.stdout.write(f"🔥 ENGAJAMENTO TOTAL: {total_comments + total_likes + total_shares}")
        
        # Top posts
        if top_posts:
            self.stdout.write(f"\n🏆 POSTS COM MAIS COMENTÁRIOS:")
            for i, post in enumerate(top_posts, 1):
                self.stdout.write(f"   {i}. {post['post__title'][:50]}... ({post['comments_count']} comentários)")
        
        # Alertas
        if pending_comments > 0:
            self.stdout.write(f"\n⚠️  ATENÇÃO: {pending_comments} comentário(s) aguardando aprovação!")
            self.stdout.write(f"   Execute: python manage.py moderate_comments pending")
        
        self.stdout.write("\n" + "="*60)
