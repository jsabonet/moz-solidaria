# Django Backend - Upload de Imagens

## views.py
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.conf import settings
import os
import uuid

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image(request):
    if 'image' not in request.FILES:
        return Response({'error': 'Nenhuma imagem enviada'}, status=400)
    
    image = request.FILES['image']
    
    # Validar tipo de arquivo
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if image.content_type not in allowed_types:
        return Response({'error': 'Tipo de arquivo não permitido'}, status=400)
    
    # Validar tamanho (5MB)
    if image.size > 5 * 1024 * 1024:
        return Response({'error': 'Arquivo muito grande'}, status=400)
    
    # Gerar nome único
    ext = os.path.splitext(image.name)[1]
    filename = f"{uuid.uuid4()}{ext}"
    
    # Salvar arquivo
    file_path = default_storage.save(f'uploads/images/{filename}', image)
    
    # Retornar URL completa
    if settings.USE_S3:
        url = default_storage.url(file_path)
    else:
        url = request.build_absolute_uri(settings.MEDIA_URL + file_path)
    
    return Response({'url': url})
```

## urls.py
```python
from django.urls import path
from . import views

urlpatterns = [
    path('upload/image/', views.upload_image, name='upload_image'),
    # ... outras URLs
]
```

## settings.py
```python
# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Para usar S3 (produção)
USE_S3 = os.environ.get('USE_S3', 'False').lower() == 'true'

if USE_S3:
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')
    
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
```

## CORS (settings.py)
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite
]

CORS_ALLOW_CREDENTIALS = True
```
