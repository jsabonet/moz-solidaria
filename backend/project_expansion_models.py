# Expansão do modelo Project no backend/core/models.py

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

    # Campos básicos existentes
    name = models.CharField(max_length=150, verbose_name="Nome")
    slug = models.SlugField(max_length=150, unique=True, verbose_name="Slug")
    description = models.TextField(verbose_name="Descrição")
    short_description = models.TextField(max_length=300, verbose_name="Descrição curta")
    program = models.ForeignKey(Program, on_delete=models.CASCADE, verbose_name="Programa")
    
    # NOVOS CAMPOS PROPOSTOS:
    
    # Conteúdo rico (como nos posts do blog)
    content = models.TextField(verbose_name="Conteúdo Detalhado", help_text="Descrição rica do projeto com HTML")
    excerpt = models.TextField(max_length=500, verbose_name="Resumo", blank=True)
    
    # Gestão e responsabilidade
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Responsável")
    team_members = models.ManyToManyField(User, blank=True, related_name='managed_projects', verbose_name="Equipe")
    
    # Controle de progresso
    progress_percentage = models.PositiveIntegerField(default=0, verbose_name="Progresso (%)")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', verbose_name="Prioridade")
    
    # Metas e métricas
    target_beneficiaries = models.PositiveIntegerField(default=0, verbose_name="Meta de Beneficiários")
    current_beneficiaries = models.PositiveIntegerField(default=0, verbose_name="Beneficiários Atuais")
    target_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Orçamento Previsto")
    current_spending = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Gasto Atual")
    
    # Documentação e mídia
    project_document = models.FileField(upload_to='projects/docs/', null=True, blank=True, verbose_name="Documento do Projeto")
    gallery_images = models.JSONField(default=list, blank=True, verbose_name="Galeria de Imagens")
    
    # Localização expandida
    district = models.CharField(max_length=100, blank=True, verbose_name="Distrito")
    province = models.CharField(max_length=100, blank=True, verbose_name="Província") 
    coordinates = models.JSONField(default=dict, blank=True, verbose_name="Coordenadas GPS")
    
    # Parcerias e financiamento
    funding_sources = models.JSONField(default=list, blank=True, verbose_name="Fontes de Financiamento")
    partners = models.ManyToManyField('Partner', blank=True, verbose_name="Parceiros")
    
    # SEO e visibilidade
    meta_description = models.CharField(max_length=160, blank=True, verbose_name="Meta Descrição")
    tags = models.ManyToManyField('blog.Tag', blank=True, verbose_name="Tags")
    is_public = models.BooleanField(default=True, verbose_name="Público")
    featured_on_homepage = models.BooleanField(default=False, verbose_name="Destaque na Homepage")


class ProjectUpdate(models.Model):
    """Atualizações de progresso do projeto"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=200, verbose_name="Título da Atualização")
    content = models.TextField(verbose_name="Conteúdo")
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Autor")
    
    # Métricas da atualização
    beneficiaries_reached = models.PositiveIntegerField(default=0, verbose_name="Beneficiários Alcançados")
    budget_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Valor Gasto")
    
    # Mídia
    featured_image = models.ImageField(upload_to='projects/updates/', null=True, blank=True)
    images = models.JSONField(default=list, blank=True, verbose_name="Imagens Adicionais")
    
    # Metadata
    is_milestone = models.BooleanField(default=False, verbose_name="Marco Importante")
    is_public = models.BooleanField(default=True, verbose_name="Público")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ProjectCategory(models.Model):
    """Categorias específicas para projetos (além dos Programs)"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Slug")
    description = models.TextField(blank=True, verbose_name="Descrição")
    color = models.CharField(max_length=20, default='primary', verbose_name="Cor")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Ícone")
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, verbose_name="Categoria Pai")
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    
    class Meta:
        verbose_name = "Categoria de Projeto"
        verbose_name_plural = "Categorias de Projetos"
        ordering = ['name']
