from django.urls import path
from . import views

app_name = 'videos'

# TODO: Implementar endpoints de videos
# Template para cuando agreguen endpoints:

urlpatterns = [
    # Ejemplos de endpoints a implementar:
    # path('', views.VideoListView.as_view(), name='video-list'),
    # path('<int:video_id>/', views.VideoDetailView.as_view(), name='video-detail'),
    # path('upload/', views.VideoUploadView.as_view(), name='video-upload'),
    # path('<int:video_id>/process/', views.ProcessVideoView.as_view(), name='video-process'),
]

# Documentación para developers:
# 1. Crear serializers en videos/serializers.py
# 2. Implementar views con @extend_schema decorators
# 3. Usar tag 'Videos' en la documentación
# 4. Seguir pattern de shorts/views.py para consistency