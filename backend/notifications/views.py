from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer, 
    NotificationPreferenceSerializer,
    NotificationBulkActionSerializer
)


class NotificationListView(generics.ListAPIView):
    """Lista notificações do usuário autenticado"""
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(recipient=user)
        
        # Filtros opcionais
        is_read = self.request.query_params.get('is_read')
        notification_type = self.request.query_params.get('type')
        priority = self.request.query_params.get('priority')
        
        if is_read is not None:
            is_read_bool = is_read.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_read=is_read_bool)
        
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """Detalhes e atualização de uma notificação"""
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Marca uma notificação como lida"""
    
    notification = get_object_or_404(
        Notification, 
        id=notification_id, 
        recipient=request.user
    )
    
    notification.mark_as_read()
    
    return Response({
        'message': 'Notificação marcada como lida',
        'notification': NotificationSerializer(notification).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    """Marca todas as notificações do usuário como lidas"""
    
    updated_count = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({
        'message': f'{updated_count} notificações marcadas como lidas'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_action_notifications(request):
    """Executa ações em massa nas notificações"""
    
    serializer = NotificationBulkActionSerializer(data=request.data)
    if serializer.is_valid():
        notification_ids = serializer.validated_data['notification_ids']
        action = serializer.validated_data['action']
        
        # Filtrar apenas notificações do usuário
        notifications = Notification.objects.filter(
            id__in=notification_ids,
            recipient=request.user
        )
        
        if action == 'mark_read':
            notifications.update(is_read=True)
            message = f'{notifications.count()} notificações marcadas como lidas'
        elif action == 'mark_unread':
            notifications.update(is_read=False)
            message = f'{notifications.count()} notificações marcadas como não lidas'
        elif action == 'delete':
            count = notifications.count()
            notifications.delete()
            message = f'{count} notificações deletadas'
        
        return Response({'message': message})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_stats(request):
    """Estatísticas das notificações do usuário"""
    
    user = request.user
    
    total = Notification.objects.filter(recipient=user).count()
    unread = Notification.objects.filter(recipient=user, is_read=False).count()
    
    by_type = {}
    for notification in Notification.objects.filter(recipient=user).values('notification_type'):
        type_name = notification['notification_type']
        by_type[type_name] = by_type.get(type_name, 0) + 1
    
    by_priority = {}
    for notification in Notification.objects.filter(recipient=user).values('priority'):
        priority = notification['priority']
        by_priority[priority] = by_priority.get(priority, 0) + 1
    
    return Response({
        'total': total,
        'unread': unread,
        'read': total - unread,
        'by_type': by_type,
        'by_priority': by_priority
    })


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """Visualizar e atualizar preferências de notificação"""
    
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Criar preferências se não existirem
        preference, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference
