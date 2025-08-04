from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import status, generics, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import (
    UserProfile, Cause, Skill, Certification, Donor, Beneficiary, 
    Volunteer, VolunteerCertification, Partner
)
from .serializers import (
    UserProfileSerializer, CauseSerializer, SkillSerializer, CertificationSerializer,
    DonorSerializer, BeneficiarySerializer, VolunteerSerializer, PartnerSerializer,
    UserRegistrationSerializer, DonorRegistrationSerializer, BeneficiaryRegistrationSerializer,
    VolunteerRegistrationSerializer, PartnerRegistrationSerializer
)

User = get_user_model()


# =====================================
# VIEWS EXISTENTES
# =====================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Retorna informações do usuário autenticado
    """
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
    })


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Atualiza informações do usuário autenticado
    """
    user = request.user
    data = request.data
    
    # Campos que o usuário pode atualizar
    allowed_fields = ['first_name', 'last_name', 'email']
    
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    user.save()
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
    })


# =====================================
# SISTEMA DE PERFIS DE USUÁRIO
# =====================================

class UserRegistrationView(APIView):
    """
    Registro de novos usuários com diferentes tipos de perfil
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuário criado com sucesso',
                'user_id': user.id,
                'user_type': request.data['user_type']
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileCompletionView(APIView):
    """
    Completar perfil específico após registro inicial
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user_profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil de usuário não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        user_type = user_profile.user_type
        
        if user_type == 'donor':
            return self._complete_donor_profile(request, user_profile)
        elif user_type == 'beneficiary':
            return self._complete_beneficiary_profile(request, user_profile)
        elif user_type == 'volunteer':
            return self._complete_volunteer_profile(request, user_profile)
        elif user_type == 'partner':
            return self._complete_partner_profile(request, user_profile)
        else:
            return Response(
                {'error': 'Tipo de usuário inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _complete_donor_profile(self, request, user_profile):
        serializer = DonorRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            donor = Donor.objects.get(user_profile=user_profile)
            
            # Atualizar dados do doador
            for field, value in serializer.validated_data.items():
                if field == 'preferred_causes':
                    causes = Cause.objects.filter(id__in=value)
                    donor.preferred_causes.set(causes)
                else:
                    setattr(donor, field, value)
            
            donor.save()
            return Response({'message': 'Perfil de doador completado com sucesso'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _complete_beneficiary_profile(self, request, user_profile):
        serializer = BeneficiaryRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            beneficiary = Beneficiary.objects.get(user_profile=user_profile)
            
            # Atualizar dados do beneficiário
            for field, value in serializer.validated_data.items():
                setattr(beneficiary, field, value)
            
            beneficiary.save()
            return Response({'message': 'Perfil de beneficiário completado com sucesso'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _complete_volunteer_profile(self, request, user_profile):
        serializer = VolunteerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            volunteer = Volunteer.objects.get(user_profile=user_profile)
            
            # Atualizar dados do voluntário
            for field, value in serializer.validated_data.items():
                if field == 'skills':
                    skills = Skill.objects.filter(id__in=value)
                    volunteer.skills.set(skills)
                elif field == 'preferred_causes':
                    causes = Cause.objects.filter(id__in=value)
                    volunteer.preferred_causes.set(causes)
                else:
                    setattr(volunteer, field, value)
            
            volunteer.save()
            return Response({'message': 'Perfil de voluntário completado com sucesso'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _complete_partner_profile(self, request, user_profile):
        serializer = PartnerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            partner = Partner.objects.get(user_profile=user_profile)
            
            # Atualizar dados do parceiro
            for field, value in serializer.validated_data.items():
                if field == 'areas_of_expertise':
                    causes = Cause.objects.filter(id__in=value)
                    partner.areas_of_expertise.set(causes)
                else:
                    setattr(partner, field, value)
            
            partner.save()
            return Response({'message': 'Perfil de parceiro completado com sucesso'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar perfis de usuário
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Usuários só podem ver seus próprios perfis (ou admins podem ver todos)
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil do usuário autenticado"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class CauseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar causas (somente leitura)
    """
    queryset = Cause.objects.filter(is_active=True)
    serializer_class = CauseSerializer
    permission_classes = [AllowAny]


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar habilidades (somente leitura)
    """
    queryset = Skill.objects.filter(is_active=True)
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]


class CertificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar certificações (somente leitura)
    """
    queryset = Certification.objects.filter(is_active=True)
    serializer_class = CertificationSerializer
    permission_classes = [AllowAny]


class DonorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar perfis de doadores
    """
    serializer_class = DonorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Donor.objects.all()
        return Donor.objects.filter(user_profile__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil de doador do usuário autenticado"""
        try:
            donor = Donor.objects.get(user_profile__user=request.user)
            serializer = self.get_serializer(donor)
            return Response(serializer.data)
        except Donor.DoesNotExist:
            return Response(
                {'error': 'Perfil de doador não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class BeneficiaryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar perfis de beneficiários
    """
    serializer_class = BeneficiarySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Beneficiary.objects.all()
        return Beneficiary.objects.filter(user_profile__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil de beneficiário do usuário autenticado"""
        try:
            beneficiary = Beneficiary.objects.get(user_profile__user=request.user)
            serializer = self.get_serializer(beneficiary)
            return Response(serializer.data)
        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Perfil de beneficiário não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class VolunteerViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar perfis de voluntários
    """
    serializer_class = VolunteerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Volunteer.objects.all()
        return Volunteer.objects.filter(user_profile__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil de voluntário do usuário autenticado"""
        try:
            volunteer = Volunteer.objects.get(user_profile__user=request.user)
            serializer = self.get_serializer(volunteer)
            return Response(serializer.data)
        except Volunteer.DoesNotExist:
            return Response(
                {'error': 'Perfil de voluntário não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class PartnerViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar perfis de parceiros
    """
    serializer_class = PartnerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Partner.objects.all()
        return Partner.objects.filter(user_profile__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil de parceiro do usuário autenticado"""
        try:
            partner = Partner.objects.get(user_profile__user=request.user)
            serializer = self.get_serializer(partner)
            return Response(serializer.data)
        except Partner.DoesNotExist:
            return Response(
                {'error': 'Perfil de parceiro não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )


# =====================================
# VIEWS DE DASHBOARD
# =====================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Retorna estatísticas para o dashboard baseadas no tipo de usuário
    """
    try:
        user_profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'Perfil de usuário não encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    user_type = user_profile.user_type
    
    if user_type == 'donor':
        return _get_donor_stats(request.user)
    elif user_type == 'beneficiary':
        return _get_beneficiary_stats(request.user)
    elif user_type == 'volunteer':
        return _get_volunteer_stats(request.user)
    elif user_type == 'partner':
        return _get_partner_stats(request.user)
    else:
        return Response({'stats': {}})


def _get_donor_stats(user):
    """Estatísticas para doadores"""
    try:
        donor = Donor.objects.get(user_profile__user=user)
        return Response({
            'total_donated': donor.total_donated,
            'first_donation': donor.first_donation_date,
            'last_donation': donor.last_donation_date,
            'preferred_causes_count': donor.preferred_causes.count(),
            'user_type': 'donor'
        })
    except Donor.DoesNotExist:
        return Response({'error': 'Perfil de doador não encontrado'}, status=404)


def _get_beneficiary_stats(user):
    """Estatísticas para beneficiários"""
    try:
        beneficiary = Beneficiary.objects.get(user_profile__user=user)
        return Response({
            'family_size': beneficiary.family_size,
            'community': beneficiary.community,
            'verification_status': beneficiary.verification_status,
            'children_count': beneficiary.children_count,
            'user_type': 'beneficiary'
        })
    except Beneficiary.DoesNotExist:
        return Response({'error': 'Perfil de beneficiário não encontrado'}, status=404)


def _get_volunteer_stats(user):
    """Estatísticas para voluntários"""
    try:
        volunteer = Volunteer.objects.get(user_profile__user=user)
        return Response({
            'total_hours': volunteer.total_hours,
            'projects_completed': volunteer.projects_completed,
            'rating': volunteer.rating,
            'skills_count': volunteer.skills.count(),
            'user_type': 'volunteer'
        })
    except Volunteer.DoesNotExist:
        return Response({'error': 'Perfil de voluntário não encontrado'}, status=404)


def _get_partner_stats(user):
    """Estatísticas para parceiros"""
    try:
        partner = Partner.objects.get(user_profile__user=user)
        return Response({
            'organization_name': partner.organization_name,
            'partnership_level': partner.partnership_level,
            'areas_of_expertise_count': partner.areas_of_expertise.count(),
            'partnership_start_date': partner.partnership_start_date,
            'user_type': 'partner'
        })
    except Partner.DoesNotExist:
        return Response({'error': 'Perfil de parceiro não encontrado'}, status=404)
