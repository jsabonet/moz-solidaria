# backend/client_area/tests.py
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import UserProfile, Notification, MatchingRequest, DashboardStats, Cause, Skill


class UserProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_user_profile_creation(self):
        """Teste criação automática de perfil"""
        # Perfil deve ser criado automaticamente via signal
        self.assertTrue(hasattr(self.user, 'client_profile'))
        self.assertEqual(self.user.client_profile.user_type, 'donor')

    def test_user_profile_full_name(self):
        """Teste propriedade full_name"""
        self.user.first_name = 'João'
        self.user.last_name = 'Silva'
        self.user.save()
        
        self.assertEqual(self.user.client_profile.full_name, 'João Silva')

    def test_user_profile_str(self):
        """Teste método __str__"""
        self.user.first_name = 'João'
        self.user.last_name = 'Silva'
        self.user.save()
        
        profile = self.user.client_profile
        profile.user_type = 'volunteer'
        profile.save()
        
        self.assertEqual(str(profile), 'João Silva (Voluntário)')


class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.profile = self.user.client_profile

    def test_notification_creation(self):
        """Teste criação de notificação"""
        notification = Notification.objects.create(
            user_profile=self.profile,
            title='Teste',
            message='Mensagem de teste',
            type='info'
        )
        
        self.assertEqual(notification.title, 'Teste')
        self.assertFalse(notification.is_read)
        self.assertEqual(notification.type, 'info')

    def test_notification_ordering(self):
        """Teste ordenação por data de criação"""
        notif1 = Notification.objects.create(
            user_profile=self.profile,
            title='Primeira',
            message='Primeira mensagem'
        )
        notif2 = Notification.objects.create(
            user_profile=self.profile,
            title='Segunda',
            message='Segunda mensagem'
        )
        
        notifications = Notification.objects.filter(user_profile=self.profile)
        self.assertEqual(notifications.first(), notif2)  # Mais recente primeiro


class AuthAPITest(APITestCase):
    def test_user_registration(self):
        """Teste registro de usuário"""
        url = reverse('client_area:register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'testpass123',
            'confirm_password': 'testpass123',
            'first_name': 'Novo',
            'last_name': 'Usuário',
            'user_type': 'volunteer',
            'phone': '+258123456789'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        
        # Verificar criação do usuário e perfil
        user = User.objects.get(username='newuser')
        self.assertEqual(user.client_profile.user_type, 'volunteer')
        self.assertEqual(user.client_profile.phone, '+258123456789')

    def test_user_registration_password_mismatch(self):
        """Teste registro com senhas diferentes"""
        url = reverse('client_area:register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'testpass123',
            'confirm_password': 'different123',
            'user_type': 'donor'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        """Teste login de usuário"""
        user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        url = reverse('client_area:login')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

    def test_user_login_invalid_credentials(self):
        """Teste login com credenciais inválidas"""
        url = reverse('client_area:login')
        data = {
            'username': 'nonexistent',
            'password': 'wrongpass'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserProfileAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            first_name='João',
            last_name='Silva'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_get_user_profile(self):
        """Teste obtenção do perfil do usuário"""
        url = reverse('client_area:profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'testuser')
        self.assertEqual(response.data['full_name'], 'João Silva')

    def test_update_user_profile(self):
        """Teste atualização do perfil"""
        url = reverse('client_area:profile')
        data = {
            'phone': '+258123456789',
            'address': 'Maputo, Moçambique',
            'user_type': 'volunteer'
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone'], '+258123456789')
        self.assertEqual(response.data['user_type'], 'volunteer')


class NotificationAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        self.profile = self.user.client_profile
        
        # Criar algumas notificações de teste
        self.notification1 = Notification.objects.create(
            user_profile=self.profile,
            title='Notificação 1',
            message='Primeira notificação',
            type='info'
        )
        self.notification2 = Notification.objects.create(
            user_profile=self.profile,
            title='Notificação 2',
            message='Segunda notificação',
            type='success',
            is_read=True
        )

    def test_list_notifications(self):
        """Teste listagem de notificações"""
        url = reverse('client_area:notifications')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_filter_notifications_by_read_status(self):
        """Teste filtro por status de leitura"""
        url = reverse('client_area:notifications')
        response = self.client.get(f'{url}?is_read=false')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Notificação 1')

    def test_mark_notification_as_read(self):
        """Teste marcar notificação como lida"""
        url = reverse('client_area:mark-notification-read', 
                     kwargs={'notification_id': self.notification1.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar se foi marcada como lida
        self.notification1.refresh_from_db()
        self.assertTrue(self.notification1.is_read)

    def test_mark_all_notifications_as_read(self):
        """Teste marcar todas as notificações como lidas"""
        url = reverse('client_area:mark-all-notifications-read')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar se todas foram marcadas como lidas
        unread_count = Notification.objects.filter(
            user_profile=self.profile, 
            is_read=False
        ).count()
        self.assertEqual(unread_count, 0)


class MatchingRequestAPITest(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='requester',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='volunteer',
            password='testpass123'
        )
        
        self.profile1 = self.user1.client_profile
        self.profile1.user_type = 'beneficiary'
        self.profile1.save()
        
        self.profile2 = self.user2.client_profile
        self.profile2.user_type = 'volunteer'
        self.profile2.save()
        
        self.cause = Cause.objects.create(
            name='Educação',
            description='Apoio educacional'
        )
        
        self.token1 = Token.objects.create(user=self.user1)
        self.token2 = Token.objects.create(user=self.user2)

    def test_create_matching_request(self):
        """Teste criação de pedido de matching"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        
        url = reverse('client_area:matching-requests')
        data = {
            'title': 'Preciso de ajuda com matemática',
            'description': 'Estou com dificuldades em álgebra',
            'location': 'Maputo',
            'cause_id': self.cause.id,
            'priority': 'medium',
            'start_date': '2024-12-01T10:00:00Z',
            'end_date': '2024-12-01T12:00:00Z'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Preciso de ajuda com matemática')
        self.assertEqual(response.data['requester']['id'], self.profile1.id)

    def test_accept_matching_request(self):
        """Teste aceitar pedido de matching"""
        # Criar pedido
        matching_request = MatchingRequest.objects.create(
            requester=self.profile1,
            title='Teste',
            description='Descrição',
            location='Maputo',
            cause=self.cause,
            start_date='2024-12-01T10:00:00Z',
            end_date='2024-12-01T12:00:00Z'
        )
        
        # Voluntário aceita o pedido
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2.key}')
        url = reverse('client_area:accept-matching-request', 
                     kwargs={'request_id': matching_request.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar se o pedido foi aceito
        matching_request.refresh_from_db()
        self.assertEqual(matching_request.volunteer, self.profile2)
        self.assertEqual(matching_request.status, 'in_progress')

    def test_cannot_accept_own_request(self):
        """Teste que não pode aceitar próprio pedido"""
        matching_request = MatchingRequest.objects.create(
            requester=self.profile1,
            title='Teste',
            description='Descrição',
            location='Maputo',
            cause=self.cause,
            start_date='2024-12-01T10:00:00Z',
            end_date='2024-12-01T12:00:00Z'
        )
        
        # Mesmo usuário tenta aceitar seu próprio pedido
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        url = reverse('client_area:accept-matching-request', 
                     kwargs={'request_id': matching_request.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DashboardStatsAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_get_dashboard_stats(self):
        """Teste obtenção de estatísticas do dashboard"""
        url = reverse('client_area:dashboard-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_donations', response.data)
        self.assertIn('volunteer_hours', response.data)
        self.assertIn('last_updated', response.data)


class CauseAndSkillAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        self.cause = Cause.objects.create(
            name='Educação',
            description='Apoio educacional'
        )
        self.skill = Skill.objects.create(
            name='Matemática',
            category='Educação'
        )

    def test_list_causes(self):
        """Teste listagem de causas"""
        url = reverse('client_area:causes')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Educação')

    def test_list_skills(self):
        """Teste listagem de habilidades"""
        url = reverse('client_area:skills')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Matemática')

    def test_filter_skills_by_category(self):
        """Teste filtro de habilidades por categoria"""
        url = reverse('client_area:skills')
        response = self.client.get(f'{url}?category=Educação')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
