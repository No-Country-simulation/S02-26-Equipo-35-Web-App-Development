from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShortViewSet

router = DefaultRouter()
router.register(r"", ShortViewSet, basename="short")

urlpatterns = [
    path("", include(router.urls)),
]
