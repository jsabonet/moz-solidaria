#!/usr/bin/env python
"""
Django management script to ensure logs directory exists and test configuration.
Run this before other Django commands to ensure proper setup.
"""
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

def ensure_logs_directory():
    """Ensure logs directory exists"""
    logs_dir = backend_dir.parent / 'logs'
    logs_dir.mkdir(exist_ok=True)
    print(f"✓ Logs directory ensured: {logs_dir}")
    
    # Test write permissions
    try:
        test_file = logs_dir / 'test.log'
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        print("✓ Log directory is writable")
    except (OSError, PermissionError) as e:
        print(f"⚠ Warning: Cannot write to logs directory: {e}")
        print("  Django will fall back to console logging only")

def test_django_setup():
    """Test Django configuration"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
    
    try:
        import django
        django.setup()
        print("✓ Django configuration loaded successfully")
        
        # Test database connection
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✓ Database connection successful")
        
    except Exception as e:
        print(f"✗ Django setup failed: {e}")
        return False
    
    return True

if __name__ == '__main__':
    print("🔧 MOZ SOLIDÁRIA - Django Setup Check")
    print("=" * 40)
    
    # Ensure logs directory
    ensure_logs_directory()
    
    # Test Django setup
    if test_django_setup():
        print("\n🎉 All checks passed! Django is ready to use.")
        print("\nYou can now run:")
        print("  python manage.py migrate")
        print("  python manage.py collectstatic")
        print("  python manage.py runserver")
    else:
        print("\n❌ Setup check failed. Please fix the errors above.")
        sys.exit(1)
