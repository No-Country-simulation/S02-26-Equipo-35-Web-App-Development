from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VideoViewSet

router = DefaultRouter()
router.register(r"", VideoViewSet, basename="video")  # lista de videos

app_name = "videos"

urlpatterns = [
    path("", include(router.urls)),
]
