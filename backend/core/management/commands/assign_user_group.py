# backend/core/management/commands/assign_user_group.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.permissions import assign_user_to_group, GROUPS_PERMISSIONS

User = get_user_model()

class Command(BaseCommand):
    help = 'Atribui um usuário a um grupo específico'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Nome de usuário')
        parser.add_argument('group', type=str, help='Nome do grupo')
        parser.add_argument(
            '--list-groups',
            action='store_true',
            help='Lista todos os grupos disponíveis',
        )

    def handle(self, *args, **options):
        if options['list_groups']:
            self.stdout.write('Grupos disponíveis:')
            for group_name in GROUPS_PERMISSIONS.keys():
                self.stdout.write(f'  - {group_name}')
            return

        username = options['username']
        group_name = options['group']

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Usuário "{username}" não encontrado')
            )
            return

        if group_name not in GROUPS_PERMISSIONS:
            self.stdout.write(
                self.style.ERROR(f'Grupo "{group_name}" não existe')
            )
            self.stdout.write('Grupos disponíveis:')
            for available_group in GROUPS_PERMISSIONS.keys():
                self.stdout.write(f'  - {available_group}')
            return

        success = assign_user_to_group(user, group_name)
        if success:
            self.stdout.write(
                self.style.SUCCESS(f'Usuário "{username}" atribuído ao grupo "{group_name}"')
            )
        else:
            self.stdout.write(
                self.style.ERROR('Falha ao atribuir usuário ao grupo')
            )
