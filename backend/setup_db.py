import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def setup_database():
    try:
        # Conectar como postgres (superuser) para criar database e usuário
        conn = psycopg2.connect(
            host='localhost',
            user='postgres',  # Usando postgres como superuser
            password='jossilene',  # Assumindo que a senha do postgres é a mesma
            port=5432,
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Verificar se o usuário existe
        cursor.execute("SELECT 1 FROM pg_user WHERE usename = %s", ('joellasmim',))
        user_exists = cursor.fetchone()
        
        if not user_exists:
            # Criar usuário
            cursor.execute(sql.SQL("CREATE USER {} WITH PASSWORD %s").format(
                sql.Identifier('joellasmim')
            ), ('jossilene',))
            print('Usuário joellasmim criado com sucesso!')
        else:
            print('Usuário joellasmim já existe!')
        
        # Verificar se a base de dados existe
        cursor.execute('SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s', ('moz_solidaria_db',))
        db_exists = cursor.fetchone()
        
        if not db_exists:
            # Criar base de dados
            cursor.execute(sql.SQL('CREATE DATABASE {}').format(
                sql.Identifier('moz_solidaria_db')
            ))
            print('Base de dados moz_solidaria_db criada com sucesso!')
        else:
            print('Base de dados moz_solidaria_db já existe!')
        
        # Dar permissões ao usuário
        cursor.execute(sql.SQL('GRANT ALL PRIVILEGES ON DATABASE {} TO {}').format(
            sql.Identifier('moz_solidaria_db'),
            sql.Identifier('joellasmim')
        ))
        print('Permissões concedidas ao usuário joellasmim!')
        
        cursor.close()
        conn.close()
        
        # Conectar à nova base de dados e configurar permissões do schema
        conn2 = psycopg2.connect(
            host='localhost',
            user='postgres',
            password='jossilene',
            port=5432,
            database='moz_solidaria_db'
        )
        conn2.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor2 = conn2.cursor()
        
        # Dar permissões no schema public
        cursor2.execute(sql.SQL('GRANT ALL ON SCHEMA public TO {}').format(
            sql.Identifier('joellasmim')
        ))
        cursor2.execute(sql.SQL('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {}').format(
            sql.Identifier('joellasmim')
        ))
        cursor2.execute(sql.SQL('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {}').format(
            sql.Identifier('joellasmim')
        ))
        cursor2.execute(sql.SQL('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {}').format(
            sql.Identifier('joellasmim')
        ))
        cursor2.execute(sql.SQL('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {}').format(
            sql.Identifier('joellasmim')
        ))
        
        print('Permissões do schema configuradas com sucesso!')
        
        cursor2.close()
        conn2.close()
        
        print('Configuração da base de dados concluída!')
        return True
        
    except Exception as e:
        print(f'Erro: {e}')
        return False

if __name__ == '__main__':
    setup_database()
