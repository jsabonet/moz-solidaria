# backend/apps/partnerships/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Q
from django.http import StreamingHttpResponse
import json
import time

from .models import PartnerMessage, PartnerProjectAssignment
from .serializers import (
    PartnerMessageSerializer, 
    PartnerProjectAssignmentSerializer,
    BulkReadMessagesSerializer
)


class PartnerMessageViewSet(viewsets.ModelViewSet):
    serializer_class = PartnerMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff:
            # Admin pode ver todas as mensagens
            queryset = PartnerMessage.objects.all()
            
            # Filtrar por parceiro específico se fornecido
            partner_id = self.request.query_params.get('partner_user_id')
            if partner_id:
                queryset = queryset.filter(
                    Q(partner_user_id=partner_id) | Q(sender_user_id=partner_id)
                )
                
        else:
            # Parceiro só vê suas próprias mensagens
            queryset = PartnerMessage.objects.filter(
                Q(partner_user=user) | Q(sender_user=user)
            )
        
        return queryset.select_related('sender_user', 'partner_user')
    
    def create(self, request, *args, **kwargs):
        # Adicionar contexto para inferir partner_user se admin
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Para admin, verificar se partner_user foi especificado
        if request.user.is_staff and 'partner_user' not in serializer.validated_data:
            partner_id = request.data.get('partner_user_id')
            if not partner_id:
                return Response(
                    {'error': 'partner_user_id é obrigatório para administradores'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        """Marcar múltiplas mensagens como lidas"""
        serializer = BulkReadMessagesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        message_ids = serializer.validated_data['message_ids']
        user = request.user
        
        # Filtrar mensagens que o usuário pode marcar como lidas
        if user.is_staff:
            # Admin pode marcar qualquer mensagem
            messages = PartnerMessage.objects.filter(id__in=message_ids)
        else:
            # Parceiro só pode marcar mensagens recebidas (sender_type='admin')
            messages = PartnerMessage.objects.filter(
                id__in=message_ids,
                partner_user=user,
                sender_type='admin'
            )
        
        updated_count = messages.update(read=True, read_at=timezone.now())
        
        return Response({
            'updated_count': updated_count,
            'message': f'{updated_count} mensagens marcadas como lidas'
        })
    
    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        """Marcar mensagem individual como lida"""
        message = self.get_object()
        
        # Verificar permissões
        user = request.user
        if not user.is_staff and message.partner_user != user:
            return Response(
                {'error': 'Sem permissão para marcar esta mensagem'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.read = True
        message.read_at = timezone.now()
        message.save()
        
        return Response({'message': 'Mensagem marcada como lida'})
    
    @action(detail=False, methods=['get'])
    def stream(self, request):
        """Server-Sent Events para mensagens em tempo real"""
        user = request.user
        
        def event_generator():
            # Configuração básica SSE
            yield "data: {}\n\n"  # Heartbeat inicial
            
            # Aqui você implementaria a lógica de streaming real
            # Para simplicidade, retornamos um placeholder
            while True:
                time.sleep(30)  # Heartbeat a cada 30s
                yield f"data: {json.dumps({'type': 'heartbeat', 'timestamp': timezone.now().isoformat()})}\n\n"
        
        response = StreamingHttpResponse(
            event_generator(),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache'
        response['Connection'] = 'keep-alive'
        response['Access-Control-Allow-Origin'] = '*'
        
        return response


class PartnerProjectAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = PartnerProjectAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff:
            return PartnerProjectAssignment.objects.all().select_related('partner_user', 'project')
        else:
            return PartnerProjectAssignment.objects.filter(
                partner_user=user, is_active=True
            ).select_related('project')


# View para Dashboard admin (integração)
class AdminPartnerDashboardView(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def partners_summary(self, request):
        """Resumo de todos os parceiros para o dashboard admin"""
        partners = User.objects.filter(
            profile__user_type='partner'
        ).prefetch_related('assigned_projects', 'partner_messages')
        
        partner_data = []
        for partner in partners:
            unread_count = partner.received_partner_messages.filter(
                read=False, sender_type='admin'
            ).count()
            
            projects_count = partner.assigned_projects.filter(is_active=True).count()
            
            partner_data.append({
                'id': partner.id,
                'name': partner.get_full_name() or partner.username,
                'username': partner.username,
                'email': partner.email,
                'unread_messages': unread_count,
                'active_projects': projects_count,
                'last_activity': partner.last_login.isoformat() if partner.last_login else None
            })
        
        return Response({
            'partners': partner_data,
            'total_partners': len(partner_data),
            'total_unread': sum(p['unread_messages'] for p in partner_data)
        })
    
    @action(detail=False, methods=['get'])
    def messages_overview(self, request):
        """Visão geral das mensagens para admin"""
        total_messages = PartnerMessage.objects.count()
        unread_from_partners = PartnerMessage.objects.filter(
            sender_type='partner', read=False
        ).count()
        
        recent_messages = PartnerMessage.objects.select_related(
            'sender_user', 'partner_user'
        ).order_by('-created_at')[:10]
        
        serializer = PartnerMessageSerializer(recent_messages, many=True)
        
        return Response({
            'total_messages': total_messages,
            'unread_from_partners': unread_from_partners,
            'recent_messages': serializer.data
        })
