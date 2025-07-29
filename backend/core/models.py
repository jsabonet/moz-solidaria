from django.db import models
from django.core.validators import EmailValidator, RegexValidator


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
    
    name = models.CharField(max_length=150, verbose_name="Nome")
    slug = models.SlugField(max_length=150, unique=True, verbose_name="Slug")
    description = models.TextField(verbose_name="Descrição")
    short_description = models.TextField(max_length=300, verbose_name="Descrição curta")
    program = models.ForeignKey(Program, on_delete=models.CASCADE, verbose_name="Programa")
    
    # Project details
    location = models.CharField(max_length=100, verbose_name="Localização")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning', verbose_name="Status")
    start_date = models.DateField(verbose_name="Data de início")
    end_date = models.DateField(null=True, blank=True, verbose_name="Data de fim")
    
    # Images
    featured_image = models.ImageField(upload_to='projects/', null=True, blank=True, verbose_name="Imagem principal")
    
    # Statistics
    beneficiaries = models.PositiveIntegerField(default=0, verbose_name="Beneficiários")
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Orçamento")
    
    # Metadata
    is_featured = models.BooleanField(default=False, verbose_name="Em destaque")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Projeto"
        verbose_name_plural = "Projetos"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


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
