# 📚 Guía para Desarrolladores - Documentación API

## 🎯 Cómo agregar nuevos endpoints documentados

Esta guía explica cómo agregar endpoints con documentación completa que aparecerá automáticamente en Swagger UI.

---

## 📁 Estructura por Módulo

Cada módulo (videos, users, etc.) debe seguir esta estructura:

```
app_name/
├── models.py          # Modelos Django
├── serializers.py     # Serializers DRF + documentación
├── views.py           # Views con decorators de documentación
├── urls.py            # URLs configuradas
└── tests.py           # Tests de los endpoints
```

---

## 🔧 1. Crear Serializers (serializers.py)

```python
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import YourModel

class YourModelSerializer(serializers.ModelSerializer):
    """
    Serializer para YourModel
    
    Descripción detallada de lo que representa este modelo
    y para qué se usa en la aplicación.
    """
    
    # Campos calculados con documentación
    custom_field = serializers.SerializerMethodField(
        help_text="Descripción del campo personalizado"
    )
    
    class Meta:
        model = YourModel
        fields = ['id', 'name', 'status', 'custom_field']
        
    @extend_schema_field(serializers.CharField())
    def get_custom_field(self, obj):
        """Documentación del método custom_field"""
        return "valor_calculado"

# Serializer para respuestas de lista con metadatos
class YourModelListResponseSerializer(serializers.Serializer):
    """Respuesta paginada de YourModel"""
    count = serializers.IntegerField(help_text="Total de elementos")
    next = serializers.URLField(allow_null=True, help_text="URL siguiente página")
    previous = serializers.URLField(allow_null=True, help_text="URL página anterior")
    results = YourModelSerializer(many=True, help_text="Lista de elementos")
```

---

## 🎮 2. Crear Views Documentadas (views.py)

```python
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .models import YourModel
from .serializers import YourModelSerializer, YourModelListResponseSerializer

class YourModelListView(generics.ListAPIView):
    """
    Vista para listar todos los elementos de YourModel
    """
    
    queryset = YourModel.objects.all()
    serializer_class = YourModelSerializer
    
    @extend_schema(
        operation_id="your_model_list",
        summary="Listar elementos",
        description="""
        Obtiene una lista paginada de todos los elementos disponibles.
        
        **Características:**
        - Filtros por estado
        - Ordenado por fecha de creación
        - Paginación automática
        """,
        parameters=[
            OpenApiParameter(
                name='status',
                description='Filtrar por estado',
                required=False,
                type=OpenApiTypes.STR,
                enum=['active', 'inactive', 'processing'],
                examples={
                    'active': {
                        'summary': 'Solo elementos activos',
                        'value': 'active'
                    }
                }
            ),
        ],
        responses={
            200: YourModelListResponseSerializer,
            400: {
                'description': 'Parámetros inválidos',
                'examples': {
                    'invalid_status': {
                        'summary': 'Estado inválido',
                        'value': {'error': 'Estado no válido'}
                    }
                }
            }
        },
        tags=['YourModule']  # ← Tag para agrupar en Swagger
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

@extend_schema(
    operation_id="your_model_detail", 
    summary="Obtener elemento específico",
    description="Obtiene los detalles completos de un elemento por su ID",
    responses={
        200: YourModelSerializer,
        404: {
            'description': 'Elemento no encontrado',
            'examples': {
                'not_found': {
                    'summary': 'Elemento inexistente',
                    'value': {'error': 'Element not found'}
                }
            }
        }
    },
    tags=['YourModule']  # ← Mismo tag para agrupación
)
@api_view(['GET'])
def get_your_model_detail(request, model_id):
    """Vista para obtener un elemento específico por ID"""
    try:
        instance = YourModel.objects.get(id=model_id)
        serializer = YourModelSerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except YourModel.DoesNotExist:
        return Response(
            {'error': 'Element not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
```

---

## 🛣️ 3. Configurar URLs (urls.py)

```python
from django.urls import path
from . import views

app_name = 'your_module'

urlpatterns = [
    path('', views.YourModelListView.as_view(), name='your-model-list'),
    path('<int:model_id>/', views.get_your_model_detail, name='your-model-detail'),
    # Agregar más endpoints aquí...
]
```

---

## 📝 4. Registrar en URLs principales

El módulo ya está configurado en `core/urls.py`:

```python
# Ya está listo para tu módulo:
path('api/v1/your_module/', include('your_module.urls')),
```

---

## 🏷️ 5. Tags Disponibles

Usa estos tags para agrupar tus endpoints en Swagger:

- `'Shorts'` - Videos cortos y covers
- `'Videos'` - Videos originales y procesamiento  
- `'Users'` - Autenticación y perfiles
- `'Covers'` - Portadas e imágenes

Para agregar nuevos tags, edita `TAGS` en `core/settings.py`:

```python
SPECTACULAR_SETTINGS = {
    # ...
    'TAGS': [
        # ... existentes
        {'name': 'YourModule', 'description': 'Descripción de tu módulo'},
    ],
}
```

---

## ✅ 6. Checklist Final

Antes de hacer commit, verifica:

- [ ] ✅ Serializers con docstrings completos
- [ ] ✅ Views con `@extend_schema` decorators  
- [ ] ✅ Responses de error documentadas con ejemplos
- [ ] ✅ operation_id únicos para cada endpoint
- [ ] ✅ Tags apropiados para agrupación
- [ ] ✅ URLs registradas en app y core
- [ ] ✅ Tests básicos funcionando
- [ ] ✅ Swagger UI muestra el módulo correctamente

---

## 🎯 Resultado Esperado

Al seguir esta guía, tu módulo aparecerá en:

- **Swagger UI**: `http://127.0.0.1:8000/api/docs/` (con interfaz interactiva)
- **ReDoc**: `http://127.0.0.1:8000/api/redoc/` (documentación elegante)
- **Schema JSON**: `http://127.0.0.1:8000/api/schema/?format=json`

¡Y será consistent con el resto de la API! 🚀

---

## 📚 Referencias

- **drf-spectacular docs**: https://drf-spectacular.readthedocs.io/
- **OpenAPI 3.0 spec**: https://swagger.io/specification/
- **DRF serializers**: https://www.django-rest-framework.org/api-guide/serializers/