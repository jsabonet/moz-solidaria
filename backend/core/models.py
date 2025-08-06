from django.db import models
from django.contrib.auth.models import User
from django.core.validators import EmailValidator, RegexValidator
from django.utils.text import slugify


class Contact(models.Model):
    SUBJECT_CHOICES = [
        ('general', 'Informações Gerais'),
        ('volunteer', 'Voluntariado'),
        ('donation', 'Doações'),
        ('partnership', 'Parcerias'),
        ('media', 'Imprensa'),
        ('other', 'Outros'),
    ]
    
    name = models.CharField(max_length=100, verbose_name="Nome")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        verbose_name="Telefone",
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message="Número de telefone deve estar no formato: '+999999999'. Até 15 dígitos permitidos."
        )]
    )
    subject = models.CharField(
        max_length=20, 
        choices=SUBJECT_CHOICES, 
        default='general',
        verbose_name="Assunto"
    )
    message = models.TextField(verbose_name="Mensagem")
    is_read = models.BooleanField(default=False, verbose_name="Lida")
    is_replied = models.BooleanField(default=False, verbose_name="Respondida")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criada em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizada em")
    
    class Meta:
        verbose_name = "Mensagem de Contato"
        verbose_name_plural = "Mensagens de Contato"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_subject_display()}"


class Program(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nome")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Slug")
    description = models.TextField(verbose_name="Descrição")
    short_description = models.TextField(max_length=300, verbose_name="Descrição curta")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Ícone")
    color = models.CharField(max_length=20, default='primary', verbose_name="Cor")
    image = models.ImageField(upload_to='programs/', null=True, blank=True, verbose_name="Imagem")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordem")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    # Statistics
    beneficiaries_count = models.PositiveIntegerField(default=0, verbose_name="Número de beneficiários")
    communities_reached = models.PositiveIntegerField(default=0, verbose_name="Comunidades alcançadas")
    
    class Meta:
        verbose_name = "Programa"
        verbose_name_plural = "Programas"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class ProjectCategory(models.Model):
    """
    Categorias específicas para projetos (diferentes dos programas)
    Ex: Educação -> Construção de Escolas, Formação de Professores, etc.
    """
    name = models.CharField(max_length=100, verbose_name="Nome")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Slug")
    description = models.TextField(blank=True, verbose_name="Descrição")
    color = models.CharField(
        max_length=20, 
        default='blue',
        choices=[
            ('blue', 'Azul'),
            ('green', 'Verde'),
            ('red', 'Vermelho'),
            ('yellow', 'Amarelo'),
            ('purple', 'Roxo'),
            ('orange', 'Laranja'),
            ('pink', 'Rosa'),
            ('gray', 'Cinza'),
        ],
        verbose_name="Cor"
    )
    icon = models.CharField(
        max_length=50, 
        blank=True, 
        help_text="Nome do ícone Lucide React (ex: Building, Heart, etc.)",
        verbose_name="Ícone"
    )
    program = models.ForeignKey(
        Program, 
        on_delete=models.CASCADE, 
        related_name='categories',
        verbose_name="Programa"
    )
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordem")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criada em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizada em")
    
    class Meta:
        verbose_name = "Categoria de Projeto"
        verbose_name_plural = "Categorias de Projetos"
        ordering = ['program__name', 'order', 'name']
        unique_together = ['program', 'slug']
    
    def __str__(self):
        return f"{self.program.name} - {self.name}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class TeamMember(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nome")
    role = models.CharField(max_length=100, verbose_name="Cargo")
    bio = models.TextField(blank=True, verbose_name="Biografia")
    photo = models.ImageField(upload_to='team/', null=True, blank=True, verbose_name="Foto")
    email = models.EmailField(blank=True, verbose_name="Email")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordem")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Membro da Equipe"
        verbose_name_plural = "Membros da Equipe"
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.role}"


class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planejamento'),
        ('active', 'Ativo'),
        ('completed', 'Concluído'),
        ('suspended', 'Suspenso'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    name = models.CharField(max_length=150, verbose_name="Nome")
    slug = models.SlugField(max_length=150, unique=True, verbose_name="Slug")
    description = models.TextField(verbose_name="Descrição")
    short_description = models.TextField(max_length=300, verbose_name="Descrição curta")
    content = models.TextField(blank=True, verbose_name="Conteúdo completo", help_text="Conteúdo detalhado em HTML")
    
    # Relationships
    program = models.ForeignKey(Program, on_delete=models.CASCADE, verbose_name="Programa")
    category = models.ForeignKey(
        ProjectCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Categoria"
    )
    
    # Project details
    location = models.CharField(max_length=100, verbose_name="Localização")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning', verbose_name="Status")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name="Prioridade")
    start_date = models.DateField(verbose_name="Data de início")
    end_date = models.DateField(null=True, blank=True, verbose_name="Data de fim")
    
    # Progress tracking
    progress_percentage = models.PositiveIntegerField(
        default=0, 
        verbose_name="Progresso (%)",
        help_text="Progresso do projeto em porcentagem (0-100)"
    )
    current_beneficiaries = models.PositiveIntegerField(
        default=0, 
        verbose_name="Beneficiários atuais",
        help_text="Número atual de beneficiários sendo atendidos"
    )
    target_beneficiaries = models.PositiveIntegerField(
        default=0, 
        verbose_name="Meta de beneficiários",
        help_text="Número total de beneficiários que se pretende atender"
    )
    
    # Images
    featured_image = models.ImageField(upload_to='projects/', null=True, blank=True, verbose_name="Imagem principal")
    
    # Financial
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Orçamento")
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Valor arrecadado")
    
    # SEO and metadata
    meta_title = models.CharField(max_length=160, blank=True, verbose_name="Título SEO")
    meta_description = models.CharField(max_length=320, blank=True, verbose_name="Descrição SEO")
    meta_keywords = models.CharField(max_length=255, blank=True, verbose_name="Palavras-chave SEO")
    
    # Flags
    is_featured = models.BooleanField(default=False, verbose_name="Em destaque")
    is_public = models.BooleanField(default=True, verbose_name="Público")
    accepts_donations = models.BooleanField(default=True, verbose_name="Aceita doações")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Projeto"
        verbose_name_plural = "Projetos"
        ordering = ['-is_featured', '-created_at']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if not self.meta_title:
            self.meta_title = self.name
        if not self.meta_description:
            self.meta_description = self.short_description
        super().save(*args, **kwargs)
    
    @property
    def progress_status(self):
        """Retorna o status do progresso em texto"""
        if self.progress_percentage == 0:
            return "Não iniciado"
        elif self.progress_percentage < 25:
            return "Iniciado"
        elif self.progress_percentage < 75:
            return "Em andamento"
        elif self.progress_percentage < 100:
            return "Quase concluído"
        else:
            return "Concluído"
    
    @property
    def funding_percentage(self):
        """Retorna a porcentagem de financiamento"""
        if not self.budget or self.budget == 0:
            return 0
        return min(100, (float(self.raised_amount) / float(self.budget)) * 100)


class ProjectUpdate(models.Model):
    """
    Atualizações/novidades sobre projetos específicos
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='updates', verbose_name="Projeto")
    title = models.CharField(max_length=200, verbose_name="Título")
    content = models.TextField(verbose_name="Conteúdo")
    image = models.ImageField(upload_to='project_updates/', null=True, blank=True, verbose_name="Imagem")
    is_milestone = models.BooleanField(default=False, verbose_name="É um marco", help_text="Marcar se esta atualização é um marco importante")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Criado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Atualização de Projeto"
        verbose_name_plural = "Atualizações de Projetos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.project.name} - {self.title}"


class ProjectGallery(models.Model):
    """
    Galeria de imagens para projetos
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='gallery', verbose_name="Projeto")
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(blank=True, verbose_name="Descrição")
    image = models.ImageField(upload_to='project_gallery/', verbose_name="Imagem")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordem")
    is_featured = models.BooleanField(default=False, verbose_name="Imagem destaque")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criada em")
    
    class Meta:
        verbose_name = "Imagem da Galeria"
        verbose_name_plural = "Galeria de Projetos"
        ordering = ['project', 'order', '-created_at']
    
    def __str__(self):
        return f"{self.project.name} - {self.title}"


class Testimonial(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nome")
    role = models.CharField(max_length=100, blank=True, verbose_name="Cargo/Função")
    location = models.CharField(max_length=100, blank=True, verbose_name="Localização")
    content = models.TextField(verbose_name="Depoimento")
    photo = models.ImageField(upload_to='testimonials/', null=True, blank=True, verbose_name="Foto")
    program = models.ForeignKey(Program, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Programa")
    is_featured = models.BooleanField(default=False, verbose_name="Em destaque")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordem")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Depoimento"
        verbose_name_plural = "Depoimentos"
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.role}"


class SiteSettings(models.Model):
    """
    Singleton model for site-wide settings
    """
    site_name = models.CharField(max_length=100, default="MOZ SOLIDÁRIA", verbose_name="Nome do Site")
    site_description = models.TextField(blank=True, verbose_name="Descrição do Site")
    contact_email = models.EmailField(verbose_name="Email de Contato")
    contact_phone = models.CharField(max_length=20, blank=True, verbose_name="Telefone de Contato")
    address = models.TextField(blank=True, verbose_name="Endereço")
    
    # Social Media
    facebook_url = models.URLField(blank=True, verbose_name="Facebook")
    twitter_url = models.URLField(blank=True, verbose_name="Twitter")
    instagram_url = models.URLField(blank=True, verbose_name="Instagram")
    linkedin_url = models.URLField(blank=True, verbose_name="LinkedIn")
    youtube_url = models.URLField(blank=True, verbose_name="YouTube")
    
    # Analytics
    google_analytics_id = models.CharField(max_length=50, blank=True, verbose_name="Google Analytics ID")
    
    # Logo and Images
    logo = models.ImageField(upload_to='site/', null=True, blank=True, verbose_name="Logo")
    favicon = models.ImageField(upload_to='site/', null=True, blank=True, verbose_name="Favicon")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Configurações do Site"
        verbose_name_plural = "Configurações do Site"
    
    def __str__(self):
        return self.site_name
    
    def save(self, *args, **kwargs):
        if not self.pk and SiteSettings.objects.exists():
            # Ensure only one instance exists
            raise ValueError('Só pode existir uma instância das configurações do site')
        return super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create the site settings instance"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings


# =====================================
# SISTEMA DE PERFIS DE USUÁRIO
# =====================================

class UserProfile(models.Model):
    """
    Perfil estendido do usuário com diferentes tipos
    """
    USER_TYPES = (
        ('donor', 'Doador'),
        ('beneficiary', 'Beneficiário'),
        ('volunteer', 'Voluntário'),
        ('partner', 'Parceiro'),
        ('admin', 'Administrador'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Usuário")
    user_type = models.CharField(max_length=20, choices=USER_TYPES, verbose_name="Tipo de Usuário")
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        verbose_name="Telefone",
        validators=[RegexValidator(
            regex=r'^\+?258\d{9}$',
            message="Formato: +258XXXXXXXXX"
        )]
    )
    address = models.TextField(blank=True, verbose_name="Endereço")
    date_of_birth = models.DateField(null=True, blank=True, verbose_name="Data de Nascimento")
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True, verbose_name="Foto de Perfil")
    
    # Status
    is_verified = models.BooleanField(default=False, verbose_name="Verificado")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    last_activity = models.DateTimeField(null=True, blank=True, verbose_name="Última Atividade")
    
    class Meta:
        verbose_name = "Perfil de Usuário"
        verbose_name_plural = "Perfis de Usuário"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.get_user_type_display()})"


class Cause(models.Model):
    """
    Causas/áreas de atuação para categorizar doações e projetos
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    slug = models.SlugField(max_length=100, unique=True, blank=True, verbose_name="Slug")
    description = models.TextField(blank=True, verbose_name="Descrição")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Ícone")
    color = models.CharField(max_length=20, default='primary', verbose_name="Cor")
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criada em")
    
    class Meta:
        verbose_name = "Causa"
        verbose_name_plural = "Causas"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Skill(models.Model):
    """
    Habilidades para voluntários
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    category = models.CharField(max_length=50, blank=True, verbose_name="Categoria")
    description = models.TextField(blank=True, verbose_name="Descrição")
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    
    class Meta:
        verbose_name = "Habilidade"
        verbose_name_plural = "Habilidades"
        ordering = ['category', 'name']
    
    def __str__(self):
        return self.name


class Certification(models.Model):
    """
    Certificações para voluntários
    """
    name = models.CharField(max_length=150, verbose_name="Nome")
    issuer = models.CharField(max_length=100, verbose_name="Emissor")
    description = models.TextField(blank=True, verbose_name="Descrição")
    validity_period = models.PositiveIntegerField(null=True, blank=True, verbose_name="Validade (meses)")
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    
    class Meta:
        verbose_name = "Certificação"
        verbose_name_plural = "Certificações"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.issuer}"


class Donor(models.Model):
    """
    Perfil específico para doadores
    """
    DONATION_FREQUENCY = (
        ('one_time', 'Única'),
        ('monthly', 'Mensal'),
        ('quarterly', 'Trimestral'),
        ('annual', 'Anual'),
    )
    
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, verbose_name="Perfil")
    total_donated = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Total Doado")
    first_donation_date = models.DateTimeField(null=True, blank=True, verbose_name="Primeira Doação")
    last_donation_date = models.DateTimeField(null=True, blank=True, verbose_name="Última Doação")
    preferred_frequency = models.CharField(max_length=20, choices=DONATION_FREQUENCY, default='one_time', verbose_name="Frequência Preferida")
    preferred_causes = models.ManyToManyField(Cause, blank=True, verbose_name="Causas Preferidas")
    
    # Comunicação
    communication_preferences = models.JSONField(default=dict, verbose_name="Preferências de Comunicação")
    receive_updates = models.BooleanField(default=True, verbose_name="Receber Atualizações")
    receive_receipts = models.BooleanField(default=True, verbose_name="Receber Recibos")
    
    # Reconhecimento
    anonymous_donations = models.BooleanField(default=False, verbose_name="Doações Anônimas")
    public_recognition = models.BooleanField(default=True, verbose_name="Reconhecimento Público")
    
    class Meta:
        verbose_name = "Doador"
        verbose_name_plural = "Doadores"
        ordering = ['-total_donated']
    
    def __str__(self):
        return f"Doador: {self.user_profile.user.get_full_name() or self.user_profile.user.username}"


class Beneficiary(models.Model):
    """
    Perfil específico para beneficiários
    """
    FAMILY_STATUS = (
        ('single', 'Solteiro(a)'),
        ('married', 'Casado(a)'),
        ('divorced', 'Divorciado(a)'),
        ('widowed', 'Viúvo(a)'),
    )
    
    VERIFICATION_STATUS = (
        ('pending', 'Pendente'),
        ('verified', 'Verificado'),
        ('rejected', 'Rejeitado'),
        ('review', 'Em Revisão'),
    )
    
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, verbose_name="Perfil")
    family_size = models.PositiveIntegerField(verbose_name="Tamanho da Família")
    children_count = models.PositiveIntegerField(default=0, verbose_name="Número de Filhos")
    family_status = models.CharField(max_length=20, choices=FAMILY_STATUS, verbose_name="Estado Civil")
    
    # Localização
    community = models.CharField(max_length=100, verbose_name="Comunidade")
    district = models.CharField(max_length=100, verbose_name="Distrito")
    province = models.CharField(max_length=100, default='Cabo Delgado', verbose_name="Província")
    
    # Situação
    needs_assessment = models.JSONField(default=dict, verbose_name="Avaliação de Necessidades")
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending', verbose_name="Status de Verificação")
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_beneficiaries', verbose_name="Verificado por")
    verification_date = models.DateTimeField(null=True, blank=True, verbose_name="Data de Verificação")
    
    # Documentação
    identity_document = models.FileField(upload_to='beneficiaries/documents/', null=True, blank=True, verbose_name="Documento de Identidade")
    proof_of_residence = models.FileField(upload_to='beneficiaries/documents/', null=True, blank=True, verbose_name="Comprovante de Residência")
    
    class Meta:
        verbose_name = "Beneficiário"
        verbose_name_plural = "Beneficiários"
        ordering = ['community', 'user_profile__user__first_name']
    
    def __str__(self):
        return f"Beneficiário: {self.user_profile.user.get_full_name() or self.user_profile.user.username} - {self.community}"


class Volunteer(models.Model):
    """
    Perfil específico para voluntários
    """
    AVAILABILITY_TYPE = (
        ('weekdays', 'Dias de Semana'),
        ('weekends', 'Fins de Semana'),
        ('evenings', 'Noites'),
        ('flexible', 'Flexível'),
    )
    
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, verbose_name="Perfil")
    skills = models.ManyToManyField(Skill, blank=True, verbose_name="Habilidades")
    certifications = models.ManyToManyField(Certification, through='VolunteerCertification', blank=True, verbose_name="Certificações")
    
    # Disponibilidade
    availability = models.JSONField(default=dict, verbose_name="Disponibilidade")
    availability_type = models.CharField(max_length=20, choices=AVAILABILITY_TYPE, default='flexible', verbose_name="Tipo de Disponibilidade")
    max_hours_per_week = models.PositiveIntegerField(null=True, blank=True, verbose_name="Máximo de Horas por Semana")
    
    # Estatísticas
    total_hours = models.PositiveIntegerField(default=0, verbose_name="Total de Horas")
    projects_completed = models.PositiveIntegerField(default=0, verbose_name="Projetos Concluídos")
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, verbose_name="Avaliação")
    
    # Preferências
    preferred_causes = models.ManyToManyField(Cause, blank=True, verbose_name="Causas Preferidas")
    transportation_available = models.BooleanField(default=False, verbose_name="Transporte Disponível")
    remote_work_available = models.BooleanField(default=True, verbose_name="Trabalho Remoto")
    
    class Meta:
        verbose_name = "Voluntário"
        verbose_name_plural = "Voluntários"
        ordering = ['-total_hours']
    
    def __str__(self):
        return f"Voluntário: {self.user_profile.user.get_full_name() or self.user_profile.user.username}"


class VolunteerCertification(models.Model):
    """
    Certificações específicas de voluntários com datas
    """
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, verbose_name="Voluntário")
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, verbose_name="Certificação")
    obtained_date = models.DateField(verbose_name="Data de Obtenção")
    expiry_date = models.DateField(null=True, blank=True, verbose_name="Data de Expiração")
    certificate_file = models.FileField(upload_to='volunteers/certificates/', null=True, blank=True, verbose_name="Arquivo do Certificado")
    
    class Meta:
        verbose_name = "Certificação de Voluntário"
        verbose_name_plural = "Certificações de Voluntários"
        unique_together = ['volunteer', 'certification']
    
    def __str__(self):
        return f"{self.volunteer} - {self.certification}"


class Partner(models.Model):
    """
    Perfil específico para parceiros
    """
    ORGANIZATION_TYPE = (
        ('ngo', 'ONG'),
        ('company', 'Empresa'),
        ('government', 'Governo'),
        ('international', 'Organização Internacional'),
        ('religious', 'Organização Religiosa'),
        ('academic', 'Instituição Acadêmica'),
    )
    
    PARTNERSHIP_LEVEL = (
        ('strategic', 'Estratégico'),
        ('operational', 'Operacional'),
        ('financial', 'Financeiro'),
        ('technical', 'Técnico'),
    )
    
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, verbose_name="Perfil")
    organization_name = models.CharField(max_length=200, verbose_name="Nome da Organização")
    organization_type = models.CharField(max_length=20, choices=ORGANIZATION_TYPE, verbose_name="Tipo de Organização")
    partnership_level = models.CharField(max_length=20, choices=PARTNERSHIP_LEVEL, verbose_name="Nível de Parceria")
    
    # Detalhes da organização
    tax_id = models.CharField(max_length=50, blank=True, verbose_name="NUIT")
    website = models.URLField(blank=True, verbose_name="Site")
    established_date = models.DateField(null=True, blank=True, verbose_name="Data de Fundação")
    
    # Contato
    contact_person = models.CharField(max_length=100, verbose_name="Pessoa de Contato")
    contact_email = models.EmailField(verbose_name="Email de Contato")
    contact_phone = models.CharField(max_length=20, verbose_name="Telefone de Contato")
    
    # Capacidades
    areas_of_expertise = models.ManyToManyField(Cause, blank=True, verbose_name="Áreas de Especialização")
    resources_available = models.JSONField(default=dict, verbose_name="Recursos Disponíveis")
    
    # Parceria
    partnership_start_date = models.DateField(null=True, blank=True, verbose_name="Início da Parceria")
    partnership_agreement = models.FileField(upload_to='partners/agreements/', null=True, blank=True, verbose_name="Acordo de Parceria")
    
    class Meta:
        verbose_name = "Parceiro"
        verbose_name_plural = "Parceiros"
        ordering = ['organization_name']
    
    def __str__(self):
        return f"Parceiro: {self.organization_name}"
