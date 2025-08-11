# backend/beneficiaries/management/commands/populate_beneficiary_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from beneficiaries.models import BeneficiaryProfile, SupportRequest, BeneficiaryCommunication
from datetime import date, datetime, timedelta
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Popula o banco de dados com dados de exemplo para beneficiários'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Limpa dados existentes antes de popular',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Limpando dados existentes...')
            BeneficiaryProfile.objects.all().delete()
            User.objects.filter(beneficiary_profile__isnull=False).delete()

        self.stdout.write('Criando beneficiários de exemplo...')

        # Dados realistas para Cabo Delgado
        distritos = [
            'Mocímboa da Praia', 'Palma', 'Nangade', 'Mueda', 'Muidumbe',
            'Macomia', 'Quissanga', 'Pemba', 'Metuge', 'Ancuabe',
            'Chiúre', 'Namuno', 'Balama', 'Montepuez', 'Meluco'
        ]

        postos_administrativos = {
            'Mocímboa da Praia': ['Mocímboa da Praia Sede', 'Ntokota', 'Limboane'],
            'Palma': ['Palma Sede', 'Quitunda', 'Pundanhar'],
            'Pemba': ['Pemba Sede', 'Metoro', 'Ngapa'],
            'Montepuez': ['Montepuez Sede', 'Namapa', 'Nairoto'],
            'Mueda': ['Mueda Sede', 'Nkoheka', 'Chiponde']
        }

        localidades_exemplo = [
            'Aldeia Central', 'Bairro 1º de Maio', 'Paquite', 'Nanhimba',
            'Mieze', 'Olumbi', 'Nangololo', 'Chitunda', 'Naulala'
        ]

        # Criar 20 beneficiários
        beneficiarios_criados = []
        
        for i in range(1, 21):
            # Dados do usuário
            email = f'beneficiario{i}@exemplo.com'
            username = f'beneficiario{i}'
            
            # Criar usuário
            user = User.objects.create_user(
                username=username,
                email=email,
                password='password123',
                first_name=f'Beneficiário{i}',
                last_name=f'Silva{i}'
            )

            # Dados do perfil
            distrito = random.choice(distritos)
            posto = random.choice(postos_administrativos.get(distrito, ['Sede']))
            localidade = random.choice(localidades_exemplo)

            # Gerar dados variados
            idade = random.randint(18, 65)
            data_nascimento = date.today() - timedelta(days=idade * 365)
            
            genero = random.choice(['M', 'F'])
            escolaridade = random.choice(['nenhuma', 'primario', 'secundario', 'tecnico'])
            emprego = random.choice(['desempregado', 'informal', 'formal', 'autonomo'])
            estado_civil = random.choice(['solteiro', 'casado', 'uniao', 'divorciado'])

            # Renda baseada no emprego
            if emprego == 'desempregado':
                renda = None
            elif emprego == 'informal':
                renda = Decimal(random.randint(500, 2000))
            elif emprego == 'formal':
                renda = Decimal(random.randint(3000, 8000))
            else:
                renda = Decimal(random.randint(1000, 4000))

            # Composição familiar
            num_filhos = random.randint(0, 6)
            num_idosos = random.randint(0, 2)
            num_deficientes = random.randint(0, 1)
            membros_familia = 1 + num_filhos + num_idosos + num_deficientes + random.randint(0, 2)

            # Vulnerabilidades
            e_deslocado = random.choice([True, False]) if i <= 8 else False  # 40% deslocados
            tem_doenca = random.choice([True, False]) if i <= 6 else False  # 30% com doenças

            motivo_deslocamento = ''
            detalhes_doenca = ''
            
            if e_deslocado:
                motivos = ['Conflito armado', 'Desastres naturais', 'Busca de trabalho', 'Falta de serviços básicos']
                motivo_deslocamento = random.choice(motivos)
            
            if tem_doenca:
                doencas = ['Diabetes', 'Hipertensão', 'Tuberculose', 'HIV/SIDA', 'Malária crónica']
                detalhes_doenca = f'Família com casos de {random.choice(doencas)}'

            # Necessidades prioritárias
            necessidades = [
                'Apoio alimentar para a família, especialmente para as crianças',
                'Assistência médica para problemas de saúde crónicos',
                'Apoio educacional para os filhos em idade escolar',
                'Apoio habitacional - necessita de abrigo seguro',
                'Apoio ao emprego - formação profissional',
                'Apoio psicológico para traumas do conflito',
                'Apoio jurídico para documentação',
                'Água potável e saneamento básico'
            ]

            perfil = BeneficiaryProfile.objects.create(
                user=user,
                full_name=f'{user.first_name} {user.last_name}',
                date_of_birth=data_nascimento,
                gender=genero,
                phone_number=f'+258 8{random.randint(1000000, 9999999)}',
                alternative_phone=f'+258 8{random.randint(1000000, 9999999)}' if random.choice([True, False]) else '',
                province='Cabo Delgado',
                district=distrito,
                administrative_post=posto,
                locality=localidade,
                neighborhood=f'Bairro {random.choice(["A", "B", "C", "Central"])}',
                address_details=f'Casa nº {random.randint(1, 100)}, próximo à {random.choice(["escola", "posto de saúde", "mercado"])}',
                education_level=escolaridade,
                employment_status=emprego,
                monthly_income=renda,
                family_status=estado_civil,
                family_members_count=membros_familia,
                children_count=num_filhos,
                elderly_count=num_idosos,
                disabled_count=num_deficientes,
                is_displaced=e_deslocado,
                displacement_reason=motivo_deslocamento,
                has_chronic_illness=tem_doenca,
                chronic_illness_details=detalhes_doenca,
                priority_needs=random.choice(necessidades),
                additional_information=f'Família residente em {distrito} há {random.randint(1, 20)} anos.',
                is_verified=random.choice([True, False]) if i <= 15 else False  # 75% verificados
            )

            beneficiarios_criados.append(perfil)
            self.stdout.write(f'  ✓ Criado: {perfil.full_name} ({distrito})')

        self.stdout.write('\nCriando solicitações de apoio...')

        tipos_apoio = [
            ('alimentar', 'Apoio Alimentar'),
            ('medico', 'Apoio Médico'),
            ('educacao', 'Apoio Educacional'),
            ('habitacao', 'Apoio Habitacional'),
            ('emprego', 'Apoio ao Emprego'),
            ('psicologico', 'Apoio Psicológico'),
            ('emergencia', 'Apoio de Emergência')
        ]

        urgencias = ['baixa', 'media', 'alta', 'critica']
        status_opcoes = ['pendente', 'em_analise', 'aprovada', 'em_andamento', 'concluida', 'rejeitada']

        titulos_exemplos = {
            'alimentar': [
                'Solicitação de Cesta Básica para Família',
                'Apoio Nutricional para Crianças',
                'Ajuda Alimentar de Emergência',
                'Programa de Segurança Alimentar'
            ],
            'medico': [
                'Consulta Médica Especializada',
                'Medicamentos para Doença Crónica',
                'Transporte para Hospital',
                'Tratamento de Malária'
            ],
            'habitacao': [
                'Construção de Abrigo Temporário',
                'Reparação de Casa Danificada',
                'Material de Construção',
                'Realojamento de Emergência'
            ],
            'educacao': [
                'Material Escolar para Filhos',
                'Uniforme Escolar',
                'Transporte Escolar',
                'Apoio a Merenda Escolar'
            ]
        }

        # Criar 40 solicitações
        admin_user = User.objects.filter(is_staff=True).first()
        
        for i in range(40):
            beneficiario = random.choice(beneficiarios_criados)
            tipo_apoio = random.choice(tipos_apoio)
            tipo_codigo, tipo_nome = tipo_apoio
            
            titulo = random.choice(titulos_exemplos.get(tipo_codigo, [f'Solicitação de {tipo_nome}']))
            
            descricoes = {
                'alimentar': f'Nossa família de {beneficiario.family_members_count} pessoas está passando por dificuldades alimentares. Precisamos de apoio com cesta básica contendo arroz, óleo, feijão e outros alimentos essenciais.',
                'medico': f'Preciso de apoio médico para {random.choice(["mim", "meu filho", "minha esposa", "um familiar"])}. Temos dificuldades em custear {random.choice(["consultas", "medicamentos", "transporte ao hospital"])}.',
                'habitacao': f'Nossa casa foi danificada por {random.choice(["ventos fortes", "chuvas", "conflitos"])} e precisamos de apoio para {random.choice(["reparação", "construção de abrigo temporário", "materiais de construção"])}.',
                'educacao': f'Meus {beneficiario.children_count} filhos precisam de apoio educacional, especialmente {random.choice(["material escolar", "uniforme", "transporte", "merenda escolar"])}.',
                'emprego': f'Estou desempregado há {random.randint(6, 24)} meses e preciso de apoio para {random.choice(["formação profissional", "encontrar trabalho", "iniciar pequeno negócio"])}.',
                'psicologico': f'Nossa família sofreu traumas devido ao {random.choice(["conflito", "deslocamento", "perda de familiares"])} e precisamos de apoio psicológico.',
                'emergencia': f'Estamos enfrentando uma situação de emergência e precisamos de apoio imediato com {random.choice(["abrigo", "alimentação", "cuidados médicos"])}.'
            }

            descricao = descricoes.get(tipo_codigo, f'Solicitação de apoio do tipo {tipo_nome}')
            
            urgencia = random.choice(urgencias)
            status = random.choice(status_opcoes)
            
            # Datas
            data_solicitacao = datetime.now() - timedelta(days=random.randint(1, 90))
            data_necessaria = data_solicitacao + timedelta(days=random.randint(7, 60))
            
            # Custos baseados no tipo
            custos_estimados = {
                'alimentar': random.randint(2000, 8000),
                'medico': random.randint(1500, 15000),
                'habitacao': random.randint(10000, 50000),
                'educacao': random.randint(1000, 5000),
                'emprego': random.randint(3000, 15000),
                'psicologico': random.randint(2000, 8000),
                'emergencia': random.randint(3000, 20000)
            }

            solicitacao = SupportRequest.objects.create(
                beneficiary=beneficiario,
                request_type=tipo_codigo,
                title=titulo,
                description=descricao,
                urgency=urgencia,
                status=status,
                estimated_beneficiaries=random.randint(1, beneficiario.family_members_count),
                estimated_cost=Decimal(custos_estimados.get(tipo_codigo, 5000)),
                needed_by_date=data_necessaria.date(),
                requested_date=data_solicitacao
            )

            # Atualizar campos baseado no status
            if status in ['aprovada', 'em_andamento', 'concluida', 'rejeitada'] and admin_user:
                solicitacao.reviewed_by = admin_user
                solicitacao.reviewed_at = data_solicitacao + timedelta(days=random.randint(1, 7))
                solicitacao.admin_notes = f'Solicitação {status} após análise.'

            if status in ['em_andamento', 'concluida'] and admin_user:
                solicitacao.assigned_to = admin_user
                solicitacao.started_at = solicitacao.reviewed_at + timedelta(days=random.randint(1, 5))

            if status == 'concluida':
                solicitacao.completed_at = solicitacao.started_at + timedelta(days=random.randint(1, 30))
                solicitacao.actual_cost = solicitacao.estimated_cost * Decimal(random.uniform(0.8, 1.2))
                solicitacao.actual_beneficiaries = solicitacao.estimated_beneficiaries

            solicitacao.save()

            self.stdout.write(f'  ✓ Criada solicitação: {titulo} ({beneficiario.full_name})')

        self.stdout.write('\nCriando comunicações de exemplo...')

        # Criar algumas comunicações
        solicitacoes = SupportRequest.objects.all()[:10]  # Primeiras 10 solicitações
        
        for solicitacao in solicitacoes:
            # Mensagem do beneficiário
            BeneficiaryCommunication.objects.create(
                support_request=solicitacao,
                sender=solicitacao.beneficiary.user,
                message_type='pergunta',
                subject='Pergunta sobre minha solicitação',
                message=f'Gostaria de saber sobre o andamento da minha solicitação de {solicitacao.get_request_type_display()}. Quando posso esperar uma resposta?',
                created_at=solicitacao.requested_date + timedelta(days=3)
            )

            # Resposta do admin (se existir)
            if admin_user and random.choice([True, False]):
                BeneficiaryCommunication.objects.create(
                    support_request=solicitacao,
                    sender=admin_user,
                    message_type='atualizacao',
                    subject='Atualização sobre sua solicitação',
                    message=f'Sua solicitação está sendo analisada pela nossa equipe. Em breve entraremos em contato com mais informações.',
                    created_at=solicitacao.requested_date + timedelta(days=5),
                    is_read=random.choice([True, False])
                )

        self.stdout.write(self.style.SUCCESS('\n✅ Dados de beneficiários criados com sucesso!'))
        self.stdout.write(f'📊 Resumo:')
        self.stdout.write(f'   - {BeneficiaryProfile.objects.count()} beneficiários')
        self.stdout.write(f'   - {SupportRequest.objects.count()} solicitações de apoio')
        self.stdout.write(f'   - {BeneficiaryCommunication.objects.count()} comunicações')
        self.stdout.write(f'   - {BeneficiaryProfile.objects.filter(is_verified=True).count()} beneficiários verificados')
        self.stdout.write(f'   - {SupportRequest.objects.filter(status="pendente").count()} solicitações pendentes')
