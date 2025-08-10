from django.http import StreamingHttpResponse
from django.db.models import Q, Count
from django.contrib.auth.models import User
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
import json
import time

from .models import PartnerMessage, PartnerProjectAssignment
from .serializers import (
    PartnerMessageSerializer, PartnerMessageCreateSerializer,
    PartnerProjectAssignmentSerializer, BulkMarkAsReadSerializer,
    PartnerAssignmentResponseSerializer, UserBasicSerializer
)
from client_area.models import UserProfile


class MessagePagination(PageNumberPagination):
    """Custom pagination for messages"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PartnerMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for partner messages with real-time capabilities
    """
    serializer_class = PartnerMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagePagination
    
    def get_queryset(self):
        """Filter messages based on user role and permissions"""
        user = self.request.user
        
        # Admins can see all messages, partners only see their own
        if user.is_staff or user.is_superuser:
            queryset = PartnerMessage.objects.all()
        else:
            queryset = PartnerMessage.objects.filter(
                Q(sender=user) | Q(recipient=user)
            )
        
        # Filter by conversation partner if specified
        partner_id = self.request.query_params.get('partner_id')
        if partner_id:
            try:
                partner = User.objects.get(id=partner_id)
                if user.is_staff or user.is_superuser:
                    # Admin: show ALL messages with that partner (any admin involved)
                    queryset = queryset.filter(
                        Q(sender=partner, recipient__is_staff=True) |
                        Q(sender__is_staff=True, recipient=partner)
                    )
                else:
                    queryset = queryset.filter(
                        Q(sender=partner, recipient=user) |
                        Q(sender=user, recipient=partner)
                    )
            except User.DoesNotExist:
                pass
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(related_project_id=project_id)
        
        return queryset.select_related('sender', 'recipient', 'related_project')
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'create':
            return PartnerMessageCreateSerializer
        return PartnerMessageSerializer
    
    def perform_create(self, serializer):
        """Auto-mark message as delivered when created"""
        message = serializer.save()
        message.status = 'delivered'
        message.save()

    def create(self, request, *args, **kwargs):
        """Create a message and return full representation (including id, status, sender_type)."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        # Ensure delivered status
        if message.status == 'sent':
            message.status = 'delivered'
            message.save()
        full = PartnerMessageSerializer(message, context={'request': request})
        headers = self.get_success_headers(full.data)
        return Response(full.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a specific message as read"""
        message = self.get_object()
        
        # Only recipient can mark message as read
        if message.recipient != request.user:
            return Response(
                {'error': 'You can only mark your own messages as read'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.mark_as_read()
        
        return Response({
            'status': 'success',
            'message': 'Message marked as read',
            'read_at': message.read_at
        })
    
    @action(detail=False, methods=['post'])
    def mark_multiple_as_read(self, request):
        """Mark multiple messages as read"""
        serializer = BulkMarkAsReadSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            message_ids = serializer.validated_data['message_ids']
            
            # Mark messages as read
            updated_count = PartnerMessage.objects.filter(
                id__in=message_ids,
                recipient=request.user,
                is_read=False
            ).update(
                is_read=True,
                read_at=timezone.now(),
                status='read'
            )
            
            return Response({
                'status': 'success',
                'updated_count': updated_count,
                'message': f'{updated_count} messages marked as read'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread messages for current user"""
        unread_count = PartnerMessage.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return Response({'unread_count': unread_count})
    
    @action(detail=False, methods=['get'])
    def conversation_partners(self, request):
        """Get list of users the current user has conversations with"""
        user = request.user
        
        if user.is_staff or user.is_superuser:
            # Admins can see all partners they've communicated with
            partner_ids = PartnerMessage.objects.filter(
                Q(sender=user) | Q(recipient=user)
            ).values_list('sender', 'recipient')
            
            all_partner_ids = set()
            for sender_id, recipient_id in partner_ids:
                if sender_id != user.id:
                    all_partner_ids.add(sender_id)
                if recipient_id != user.id:
                    all_partner_ids.add(recipient_id)
            
            partners = User.objects.filter(id__in=all_partner_ids)
        else:
            # Partners can only see admins they've communicated with
            admin_ids = PartnerMessage.objects.filter(
                Q(sender=user) | Q(recipient=user)
            ).filter(
                Q(sender__is_staff=True) | Q(recipient__is_staff=True)
            ).values_list('sender', 'recipient')
            
            all_admin_ids = set()
            for sender_id, recipient_id in admin_ids:
                if sender_id != user.id:
                    all_admin_ids.add(sender_id)
                if recipient_id != user.id:
                    all_admin_ids.add(recipient_id)
            
            partners = User.objects.filter(id__in=all_admin_ids, is_staff=True)
        
        # Annotate with unread message count
        partners_with_unread = []
        for partner in partners:
            unread_count = PartnerMessage.objects.filter(
                sender=partner,
                recipient=user,
                is_read=False
            ).count()
            
            partner_data = UserBasicSerializer(partner).data
            partner_data['unread_count'] = unread_count
            partners_with_unread.append(partner_data)
        
        return Response(partners_with_unread)

    @action(detail=False, methods=['get'])
    def partner_users(self, request):
        """List all active users with partner profile (admin only unless ?all=1 by admin)."""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'Somente administradores.'}, status=403)
        profiles = UserProfile.objects.filter(user_type='partner').select_related('user')
        data = []
        for prof in profiles:
            unread = PartnerMessage.objects.filter(
                sender=prof.user, recipient__is_staff=True, is_read=False
            ).count()
            active_projects = PartnerProjectAssignment.objects.filter(
                partner=prof.user, status='accepted'
            ).count()
            data.append({
                'id': prof.user.id,
                'username': prof.user.username,
                'email': prof.user.email,
                'name': prof.full_name or prof.user.username,
                'unread_count': unread,
                'active_projects': active_projects,
            })
        return Response(data)


class PartnerProjectAssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for partner project assignments
    """
    serializer_class = PartnerProjectAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter assignments based on user role"""
        user = self.request.user
        qs = PartnerProjectAssignment.objects.all() if (user.is_staff or user.is_superuser) else PartnerProjectAssignment.objects.filter(partner=user)
        # Optional status filter (?status=pending or comma list)
        status_param = self.request.query_params.get('status')
        if status_param:
            parts = [s.strip() for s in status_param.split(',') if s.strip()]
            if parts:
                qs = qs.filter(status__in=parts)
        return qs
    
    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Respond to a project assignment (accept/reject)"""
        assignment = self.get_object()
        
        # Only the assigned partner can respond
        if assignment.partner != request.user:
            return Response(
                {'error': 'You can only respond to your own assignments'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PartnerAssignmentResponseSerializer(
            data=request.data,
            context={'request': request, 'assignment_id': assignment.id}
        )
        
        if serializer.is_valid():
            response_type = serializer.validated_data['response']
            response_notes = serializer.validated_data.get('response_notes', '')
            
            if response_type == 'accept':
                assignment.accept_assignment(response_notes)
                message = 'Assignment accepted successfully'
            else:
                assignment.reject_assignment(response_notes)
                message = 'Assignment rejected successfully'
            
            return Response({
                'status': 'success',
                'message': message,
                'assignment_status': assignment.status
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark assignment as completed (admin only)"""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Only administrators can mark assignments as completed'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        assignment = self.get_object()
        
        if assignment.status != 'accepted':
            return Response(
                {'error': 'Only accepted assignments can be marked as completed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment.complete_assignment()
        
        return Response({
            'status': 'success',
            'message': 'Assignment marked as completed',
            'completion_date': assignment.actual_end_date
        })


class AdminPartnerDashboardView:
    """
    Admin dashboard view for partnership management
    """
    permission_classes = [permissions.IsAdminUser]
    
    @staticmethod
    def get_dashboard_stats(request):
        """Get dashboard statistics for admin"""
        stats = {
            'total_partners': User.objects.filter(is_staff=False).count(),
            'active_assignments': PartnerProjectAssignment.objects.filter(status='accepted').count(),
            'pending_assignments': PartnerProjectAssignment.objects.filter(status='pending').count(),
            'unread_messages': PartnerMessage.objects.filter(
                recipient=request.user,
                is_read=False
            ).count(),
            'total_messages': PartnerMessage.objects.count(),
        }
        
        return Response(stats)
    
    @staticmethod
    def stream_messages(request):
        """Server-Sent Events stream for real-time messages"""
        def event_stream():
            last_message_id = 0
            idle_cycles = 0
            while True:
                new_messages = PartnerMessage.objects.filter(
                    id__gt=last_message_id
                ).order_by('id')
                if request.user.is_staff or request.user.is_superuser:
                    new_messages = new_messages.filter(
                        Q(sender__is_staff=True) | Q(recipient__is_staff=True)
                    )
                else:
                    new_messages = new_messages.filter(
                        Q(sender=request.user) | Q(recipient=request.user)
                    )
                if new_messages.exists():
                    for message in new_messages:
                        serializer = PartnerMessageSerializer(message, context={'request': request})
                        yield f"data: {json.dumps({'type': 'new_message', 'data': serializer.data})}\n\n"
                        last_message_id = message.id
                    idle_cycles = 0
                else:
                    idle_cycles += 1
                # Heartbeat every ~5 seconds (after each poll)
                yield f"data: {json.dumps({'type': 'heartbeat', 'ts': timezone.now().isoformat()})}\n\n"
                time.sleep(3)  # faster polling
        
        response = StreamingHttpResponse(
            event_stream(),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache'
        response['Connection'] = 'keep-alive'
        response['Access-Control-Allow-Origin'] = '*'
        
        return response


# API Views for dashboard endpoints
@action(detail=False, methods=['get'])
def dashboard_stats(request):
    """API endpoint for dashboard statistics"""
    if not (request.user.is_staff or request.user.is_superuser):
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    return AdminPartnerDashboardView.get_dashboard_stats(request)


@action(detail=False, methods=['get'])
def message_stream(request):
    """API endpoint for message streaming"""
    return AdminPartnerDashboardView.stream_messages(request)
