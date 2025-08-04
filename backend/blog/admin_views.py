from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Q
from django.contrib import messages

from .models import Comment, BlogPost, Like, Share
from .serializers import CommentSerializer, CommentAdminSerializer


class CommentAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para administração de comentários
    Apenas para usuários admin/staff
    """
    queryset = Comment.objects.all()
    serializer_class = CommentAdminSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros opcionais
        status_filter = self.request.query_params.get('status', None)
        if status_filter == 'pending':
            queryset = queryset.filter(is_approved=False)
        elif status_filter == 'approved':
            queryset = queryset.filter(is_approved=True)
        
        post_id = self.request.query_params.get('post', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        return queryset.select_related('post', 'author', 'parent').annotate(
            replies_count=Count('replies')
        ).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas gerais de comentários"""
        total_comments = Comment.objects.count()
        pending_comments = Comment.objects.filter(is_approved=False).count()
        approved_comments = Comment.objects.filter(is_approved=True).count()
        recent_comments = Comment.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()
        
        # Comentários por post (top 10)
        top_posts = Comment.objects.values(
            'post__title', 'post__slug'
        ).annotate(
            comments_count=Count('id')
        ).order_by('-comments_count')[:10]
        
        return Response({
            'total_comments': total_comments,
            'pending_comments': pending_comments,
            'approved_comments': approved_comments,
            'recent_comments': recent_comments,
            'top_posts_by_comments': top_posts,
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprovar um comentário específico"""
        comment = self.get_object()
        comment.is_approved = True
        comment.updated_at = timezone.now()
        comment.save()
        
        return Response({
            'message': f'Comentário de "{comment.author_name}" aprovado com sucesso.',
            'comment_id': comment.id,
            'is_approved': comment.is_approved
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Rejeitar um comentário específico"""
        comment = self.get_object()
        comment.is_approved = False
        comment.updated_at = timezone.now()
        comment.save()
        
        return Response({
            'message': f'Comentário de "{comment.author_name}" rejeitado.',
            'comment_id': comment.id,
            'is_approved': comment.is_approved
        })
    
    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        """Aprovar múltiplos comentários"""
        comment_ids = request.data.get('comment_ids', [])
        if not comment_ids:
            return Response(
                {'error': 'Lista de IDs de comentários é obrigatória'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated = Comment.objects.filter(
            id__in=comment_ids
        ).update(is_approved=True, updated_at=timezone.now())
        
        return Response({
            'message': f'{updated} comentário(s) aprovado(s) com sucesso.',
            'updated_count': updated
        })
    
    @action(detail=False, methods=['post'])
    def bulk_reject(self, request):
        """Rejeitar múltiplos comentários"""
        comment_ids = request.data.get('comment_ids', [])
        if not comment_ids:
            return Response(
                {'error': 'Lista de IDs de comentários é obrigatória'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated = Comment.objects.filter(
            id__in=comment_ids
        ).update(is_approved=False, updated_at=timezone.now())
        
        return Response({
            'message': f'{updated} comentário(s) rejeitado(s).',
            'updated_count': updated
        })
    
    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        """Excluir múltiplos comentários permanentemente"""
        comment_ids = request.data.get('comment_ids', [])
        if not comment_ids:
            return Response(
                {'error': 'Lista de IDs de comentários é obrigatória'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count, _ = Comment.objects.filter(id__in=comment_ids).delete()
        
        return Response({
            'message': f'{count} comentário(s) excluído(s) permanentemente.',
            'deleted_count': count
        })
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Listar apenas comentários pendentes"""
        comments = self.get_queryset().filter(is_approved=False)
        page = self.paginate_queryset(comments)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_post(self, request):
        """Agrupar comentários por post"""
        posts_with_comments = BlogPost.objects.filter(
            comments__isnull=False
        ).annotate(
            total_comments=Count('comments'),
            pending_comments=Count('comments', filter=Q(comments__is_approved=False)),
            approved_comments=Count('comments', filter=Q(comments__is_approved=True))
        ).order_by('-total_comments')
        
        data = []
        for post in posts_with_comments:
            data.append({
                'post_id': post.id,
                'post_title': post.title,
                'post_slug': post.slug,
                'total_comments': post.total_comments,
                'pending_comments': post.pending_comments,
                'approved_comments': post.approved_comments,
            })
        
        return Response(data)


class SocialStatsViewSet(viewsets.ViewSet):
    """
    ViewSet para estatísticas de interações sociais
    Apenas para usuários admin/staff
    """
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Visão geral das interações sociais"""
        # Estatísticas gerais
        total_likes = Like.objects.count()
        total_shares = Share.objects.count()
        total_comments = Comment.objects.count()
        
        # Posts mais populares
        popular_posts = BlogPost.objects.annotate(
            likes_count=Count('likes'),
            shares_count=Count('shares'),
            comments_count=Count('comments')
        ).order_by('-likes_count', '-shares_count', '-comments_count')[:10]
        
        # Atividade recente (últimos 7 dias)
        recent_date = timezone.now() - timezone.timedelta(days=7)
        recent_likes = Like.objects.filter(created_at__gte=recent_date).count()
        recent_shares = Share.objects.filter(created_at__gte=recent_date).count()
        recent_comments = Comment.objects.filter(created_at__gte=recent_date).count()
        
        # Tipos de compartilhamento
        share_types = Share.objects.values('share_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        popular_posts_data = []
        for post in popular_posts:
            popular_posts_data.append({
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'likes_count': post.likes_count,
                'shares_count': post.shares_count,
                'comments_count': post.comments_count,
                'total_engagement': post.likes_count + post.shares_count + post.comments_count
            })
        
        return Response({
            'overview': {
                'total_likes': total_likes,
                'total_shares': total_shares,
                'total_comments': total_comments,
                'total_engagement': total_likes + total_shares + total_comments
            },
            'recent_activity': {
                'recent_likes': recent_likes,
                'recent_shares': recent_shares,
                'recent_comments': recent_comments
            },
            'popular_posts': popular_posts_data,
            'share_types': share_types
        })
    
    @action(detail=False, methods=['get'])
    def engagement_trend(self, request):
        """Tendência de engajamento por período"""
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timezone.timedelta(days=days)
        
        # Agregar por dia
        from django.db.models import TruncDate
        from django.db.models.functions import Coalesce
        
        likes_by_date = Like.objects.filter(
            created_at__gte=start_date
        ).extra(
            select={'date': 'DATE(created_at)'}
        ).values('date').annotate(count=Count('id')).order_by('date')
        
        shares_by_date = Share.objects.filter(
            created_at__gte=start_date
        ).extra(
            select={'date': 'DATE(created_at)'}
        ).values('date').annotate(count=Count('id')).order_by('date')
        
        comments_by_date = Comment.objects.filter(
            created_at__gte=start_date
        ).extra(
            select={'date': 'DATE(created_at)'}
        ).values('date').annotate(count=Count('id')).order_by('date')
        
        return Response({
            'period_days': days,
            'likes_trend': list(likes_by_date),
            'shares_trend': list(shares_by_date),
            'comments_trend': list(comments_by_date)
        })
