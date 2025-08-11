# backend/beneficiaries/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class BeneficiaryProfile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
        ('O', 'Outro'),
        ('N', 'Prefiro não informar'),
    ]
    
    EDUCATION_CHOICES = [
        ('nenhuma', 'Nenhuma escolaridade'),
        ('primario', 'Ensino Primário'),
        ('secundario', 'Ensino Secundário'),
        ('tecnico', 'Ensino Técnico'),
        ('superior', 'Ensino Superior'),
    ]
    
    EMPLOYMENT_CHOICES = [
        ('desempregado', 'Desempregado'),
        ('informal', 'Trabalho Informal'),
        ('formal', 'Trabalho Formal'),
        ('autonomo', 'Autônomo'),
        ('estudante', 'Estudante'),
        ('aposentado', 'Aposentado'),
        ('domestico', 'Trabalho Doméstico'),
    ]
    
    FAMILY_STATUS_CHOICES = [
        ('solteiro', 'Solteiro(a)'),
        ('casado', 'Casado(a)'),
        ('uniao', 'União de Facto'),
        ('divorciado', 'Divorciado(a)'),
        ('viuvo', 'Viúvo(a)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='beneficiary_profile')
    
    # Informações pessoais
    full_name = models.CharField(max_length=200, verbose_name='Nome Completo')
    date_of_birth = models.DateField(verbose_name='Data de Nascimento')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name='Género')
    phone_number = models.CharField(max_length=20, verbose_name='Número de Telefone')
    alternative_phone = models.CharField(max_length=20, blank=True, verbose_name='Telefone Alternativo')
    
    # Localização
    province = models.CharField(max_length=100, default='Cabo Delgado', verbose_name='Província')
    district = models.CharField(max_length=100, verbose_name='Distrito')
    administrative_post = models.CharField(max_length=100, verbose_name='Posto Administrativo')
    locality = models.CharField(max_length=100, verbose_name='Localidade')
    neighborhood = models.CharField(max_length=100, blank=True, verbose_name='Bairro')
    address_details = models.TextField(blank=True, verbose_name='Detalhes do Endereço')
    
    # Informações socioeconômicas
    education_level = models.CharField(max_length=20, choices=EDUCATION_CHOICES, verbose_name='Nível de Escolaridade')
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_CHOICES, verbose_name='Situação de Emprego')
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Renda Mensal (MZN)')
    family_status = models.CharField(max_length=20, choices=FAMILY_STATUS_CHOICES, verbose_name='Estado Civil')
    
    # Composição familiar
    family_members_count = models.IntegerField(default=1, verbose_name='Número de Membros da Família')
    children_count = models.IntegerField(default=0, verbose_name='Número de Filhos')
    elderly_count = models.IntegerField(default=0, verbose_name='Número de Idosos')
    disabled_count = models.IntegerField(default=0, verbose_name='Número de Pessoas com Deficiência')
    
    # Situação de vulnerabilidade
    is_displaced = models.BooleanField(default=False, verbose_name='Pessoa Deslocada')
    displacement_reason = models.CharField(max_length=200, blank=True, verbose_name='Motivo do Deslocamento')
    has_chronic_illness = models.BooleanField(default=False, verbose_name='Doença Crónica na Família')
    chronic_illness_details = models.TextField(blank=True, verbose_name='Detalhes da Doença Crónica')
    
    # Necessidades prioritárias
    priority_needs = models.TextField(verbose_name='Necessidades Prioritárias')
    additional_information = models.TextField(blank=True, verbose_name='Informações Adicionais')
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False, verbose_name='Perfil Verificado')
    verification_date = models.DateTimeField(null=True, blank=True, verbose_name='Data de Verificação')
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_beneficiary_profiles')

    class Meta:
        verbose_name = 'Perfil de Beneficiário'
        verbose_name_plural = 'Perfis de Beneficiários'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.district}, {self.province})"

    @property
    def age(self):
        if self.date_of_birth:
            today = timezone.now().date()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None

    @property
    def vulnerability_score(self):
        """Calcula um score de vulnerabilidade baseado nos critérios"""
        score = 0
        
        # Situação econômica
        if self.monthly_income is None or self.monthly_income < 3000:  # Abaixo do salário mínimo
            score += 3
        elif self.monthly_income < 5000:
            score += 2
        
        # Situação de emprego
        if self.employment_status == 'desempregado':
            score += 3
        elif self.employment_status == 'informal':
            score += 2
        
        # Composição familiar
        if self.children_count > 3:
            score += 2
        if self.elderly_count > 0:
            score += 1
        if self.disabled_count > 0:
            score += 2
        
        # Vulnerabilidades específicas
        if self.is_displaced:
            score += 3
        if self.has_chronic_illness:
            score += 2
        
        # Educação
        if self.education_level in ['nenhuma', 'primario']:
            score += 1
        
        return min(score, 10)  # Máximo 10


class SupportRequest(models.Model):
    REQUEST_TYPES = [
        ('alimentar', 'Apoio Alimentar'),
        ('medico', 'Apoio Médico'),
        ('educacao', 'Apoio Educacional'),
        ('habitacao', 'Apoio Habitacional'),
        ('emprego', 'Apoio ao Emprego'),
        ('psicologico', 'Apoio Psicológico'),
        ('juridico', 'Apoio Jurídico'),
        ('emergencia', 'Apoio de Emergência'),
        ('outro', 'Outro'),
    ]
    
    URGENCY_LEVELS = [
        ('baixa', 'Baixa'),
        ('media', 'Média'),
        ('alta', 'Alta'),
        ('critica', 'Crítica'),
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('em_analise', 'Em Análise'),
        ('aprovada', 'Aprovada'),
        ('em_andamento', 'Em Andamento'),
        ('concluida', 'Concluída'),
        ('rejeitada', 'Rejeitada'),
        ('cancelada', 'Cancelada'),
    ]

    beneficiary = models.ForeignKey(BeneficiaryProfile, on_delete=models.CASCADE, related_name='support_requests')
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES, verbose_name='Tipo de Apoio')
    title = models.CharField(max_length=200, verbose_name='Título da Solicitação')
    description = models.TextField(verbose_name='Descrição Detalhada')
    urgency = models.CharField(max_length=10, choices=URGENCY_LEVELS, verbose_name='Urgência')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente', verbose_name='Status')
    
    # Valores estimados
    estimated_beneficiaries = models.IntegerField(default=1, verbose_name='Número de Beneficiários')
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Custo Estimado (MZN)')
    
    # Datas
    requested_date = models.DateTimeField(auto_now_add=True, verbose_name='Data da Solicitação')
    needed_by_date = models.DateField(null=True, blank=True, verbose_name='Necessário Até')
    
    # Aprovação/Rejeição
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_requests')
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='Data da Revisão')
    admin_notes = models.TextField(blank=True, verbose_name='Notas do Administrador')
    
    # Execução
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests')
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='Iniciado em')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Concluído em')
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Custo Real (MZN)')
    actual_beneficiaries = models.IntegerField(null=True, blank=True, verbose_name='Beneficiários Reais')
    
    class Meta:
        verbose_name = 'Solicitação de Apoio'
        verbose_name_plural = 'Solicitações de Apoio'
        ordering = ['-requested_date']

    def __str__(self):
        return f"{self.title} - {self.beneficiary.full_name} ({self.get_status_display()})"

    @property
    def is_overdue(self):
        if self.needed_by_date and self.status not in ['concluida', 'rejeitada', 'cancelada']:
            return timezone.now().date() > self.needed_by_date
        return False


class BeneficiaryCommunication(models.Model):
    MESSAGE_TYPES = [
        ('pergunta', 'Pergunta'),
        ('atualizacao', 'Atualização'),
        ('documento', 'Documento'),
        ('feedback', 'Feedback'),
        ('outro', 'Outro'),
    ]

    support_request = models.ForeignKey(SupportRequest, on_delete=models.CASCADE, related_name='communications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Remetente')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, verbose_name='Tipo de Mensagem')
    subject = models.CharField(max_length=200, verbose_name='Assunto')
    message = models.TextField(verbose_name='Mensagem')
    attachment = models.FileField(upload_to='beneficiary_communications/', blank=True, verbose_name='Anexo')
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False, verbose_name='Lida')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='Lida em')

    class Meta:
        verbose_name = 'Comunicação com Beneficiário'
        verbose_name_plural = 'Comunicações com Beneficiários'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} - {self.sender.username} ({self.created_at.strftime('%d/%m/%Y')})"


class BeneficiaryDocument(models.Model):
    DOCUMENT_TYPES = [
        ('identidade', 'Documento de Identidade'),
        ('residencia', 'Comprovativo de Residência'),
        ('renda', 'Comprovativo de Renda'),
        ('medico', 'Relatório Médico'),
        ('familia', 'Composição Familiar'),
        ('outro', 'Outro'),
    ]

    beneficiary = models.ForeignKey(BeneficiaryProfile, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, verbose_name='Tipo de Documento')
    title = models.CharField(max_length=200, verbose_name='Título')
    description = models.TextField(blank=True, verbose_name='Descrição')
    file = models.FileField(upload_to='beneficiary_documents/', verbose_name='Arquivo')
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False, verbose_name='Verificado')
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_beneficiary_documents')
    verified_at = models.DateTimeField(null=True, blank=True, verbose_name='Verificado em')

    class Meta:
        verbose_name = 'Documento do Beneficiário'
        verbose_name_plural = 'Documentos dos Beneficiários'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.title} - {self.beneficiary.full_name}"
