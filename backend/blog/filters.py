import django_filters
from django.db.models import Q
from .models import BlogPost, Category, Tag


class BlogPostFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.all())
    tags = django_filters.ModelMultipleChoiceFilter(queryset=Tag.objects.all())
    author = django_filters.CharFilter(field_name='author__username', lookup_expr='icontains')
    author_name = django_filters.CharFilter(method='filter_author_name')
    status = django_filters.ChoiceFilter(choices=BlogPost.STATUS_CHOICES)
    is_featured = django_filters.BooleanFilter()
    date_from = django_filters.DateFilter(field_name='published_at', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='published_at', lookup_expr='lte')
    search = django_filters.CharFilter(method='filter_search')
    
    class Meta:
        model = BlogPost
        fields = ['category', 'tags', 'status', 'is_featured']
    
    def filter_author_name(self, queryset, name, value):
        """Filter by author's first name or last name"""
        return queryset.filter(
            Q(author__first_name__icontains=value) | 
            Q(author__last_name__icontains=value)
        )
    
    def filter_search(self, queryset, name, value):
        """Global search in title, excerpt, and content"""
        return queryset.filter(
            Q(title__icontains=value) |
            Q(excerpt__icontains=value) |
            Q(content__icontains=value) |
            Q(tags__name__icontains=value) |
            Q(category__name__icontains=value)
        ).distinct()
