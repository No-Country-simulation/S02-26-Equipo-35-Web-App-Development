from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .models import Short
from .serializers import ShortSerializer, ErrorResponseSerializer


class ShortListView(generics.ListAPIView):
    """
    Vista para listar todos los shorts disponibles.
    """
    
    queryset = Short.objects.all().select_related('video').prefetch_related('short')
    serializer_class = ShortSerializer
    
    @extend_schema(
        summary="Listar shorts",
        description="Obtiene una lista de todos los shorts disponibles",
        tags=['Shorts']
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    def get_queryset(self):
        """
        Aplica filtros basados en query parameters
        """
        queryset = super().get_queryset()
        
        # Filtrar por status si se especifica
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtrar por video si se especifica
        video_id = self.request.query_params.get('video', None)
        if video_id:
            try:
                video_id = int(video_id)
                queryset = queryset.filter(video_id=video_id)
            except (ValueError, TypeError):
                pass
            
        return queryset.order_by('-created_at')


@extend_schema(
    summary="Obtener short específico",
    description="Obtiene los detalles de un short específico por su ID",
    responses={
        200: ShortSerializer,
        404: OpenApiResponse(
            response=ErrorResponseSerializer,
            description='Short no encontrado'
        ),
        400: OpenApiResponse(
            response=ErrorResponseSerializer,
            description='ID inválido'
        )
    },
    tags=['Shorts']
)
@api_view(['GET'])
def get_short_detail(request, short_id):
    """
    Vista para obtener un short específico por ID
    """
    try:
        short = Short.objects.select_related('video').prefetch_related('short').get(id=short_id)
        serializer = ShortSerializer(short)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Short.DoesNotExist:
        return Response(
            {'detail': 'Short not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError:
        return Response(
            {'detail': 'Invalid short ID'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
