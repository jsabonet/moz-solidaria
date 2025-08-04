# backend/client_area/routing.py
from django.urls import re_path
from . import notifications

websocket_urlpatterns = [
    re_path(r'ws/notifications/$', notifications.NotificationConsumer.as_asgi()),
]
