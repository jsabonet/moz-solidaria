#!/usr/bin/env python
from blog.models import BlogPost
from django.contrib.auth.models import User

print("\n" + "="*50)
print("ESTATISTICAS DO BLOG - PRODUCAO")
print("="*50)

total = BlogPost.objects.count()
publicados = BlogPost.objects.filter(status='published').count()
rascunhos = BlogPost.objects.filter(status='draft').count()
destaque = BlogPost.objects.filter(is_featured=True).count()

print(f"\nTotal de artigos: {total}")
print(f"Publicados: {publicados}")
print(f"Rascunhos: {rascunhos}")
print(f"Em destaque: {destaque}")

if total > 0:
    print(f"\nUltimos 5 artigos:")
    for i, post in enumerate(BlogPost.objects.order_by('-created_at')[:5], 1):
        status_icon = "PUB" if post.status == 'published' else "DRA"
        print(f"{i}. [{status_icon}] {post.title[:50]}")
        print(f"   Por: {post.author.username} em {post.created_at.strftime('%d/%m/%Y')}")

print("\n" + "="*50 + "\n")
