# backend/core/management/commands/setup_permissions.py
from django.core.management.base import BaseCommand
from core.permissions import create_custom_permissions, create_groups_and_assign_permissions

class Command(BaseCommand):
    help = 'Cria todas as permissões e grupos do sistema Moz Solidária'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Remove todas as permissões e grupos existentes antes de criar novos',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando configuração de permissões...'))

        if options['reset']:
            self.stdout.write('Removendo permissões e grupos existentes...')
            from django.contrib.auth.models import Group
            Group.objects.all().delete()
            self.stdout.write(self.style.WARNING('Grupos removidos'))

        # Criar permissões customizadas
        self.stdout.write('Criando permissões customizadas...')
        create_custom_permissions()

        # Criar grupos e atribuir permissões
        self.stdout.write('Criando grupos e atribuindo permissões...')
        create_groups_and_assign_permissions()

        self.stdout.write(
            self.style.SUCCESS('Permissões e grupos configurados com sucesso!')
        )
