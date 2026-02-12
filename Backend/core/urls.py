from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger schema view
schema_view = get_schema_view(
    openapi.Info(
        title="Mi Proyecto API",
        default_version="v1",
        description="Documentación de la API",
        terms_of_service="https://www.google.com/policies/terms/",  # opcional
        contact=openapi.Contact(email="contacto@miempresa.com"),  # opcional
        license=openapi.License(name="MIT License"),  # opcional
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # API
    path("api/videos/", include(("videos.urls", "videos"), namespace="videos")),
    path("api/shorts/", include(("shorts.urls", "shorts"), namespace="shorts")),
    path("api/auth/", include("rest_framework.urls")),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]
