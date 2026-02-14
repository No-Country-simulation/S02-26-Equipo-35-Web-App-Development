from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.http import HttpResponse

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


def health(request):
    return HttpResponse("OK")


urlpatterns = [
    path("admin/", admin.site.urls),
    # API
    path("api/videos/", include(("videos.urls", "videos"), namespace="videos")),
    path("api/shorts/", include(("shorts.urls", "shorts"), namespace="shorts")),
    path("api/", include(("users.urls", "users"), namespace="users")),
    path("api/auth/", include("rest_framework.urls")),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path(
        "swagger.json",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "swagger.yaml",
        schema_view.without_ui(cache_timeout=0),
        name="schema-yaml",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]
