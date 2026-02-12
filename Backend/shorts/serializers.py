from rest_framework import serializers
from typing import List, Dict, Any
from .models import Short, Cover


class CoverSerializer(serializers.ModelSerializer):
    """
    Serializer para Cover (portada del short)
    """
    
    class Meta:
        model = Cover
        fields = ['id', 'image_url', 'frame_second', 'is_selected']


class ShortSerializer(serializers.ModelSerializer):
    """
    Serializer para Short (video corto vertical)
    """
    
    covers = serializers.SerializerMethodField(
        help_text="Lista de portadas disponibles para el short"
    )
    
    class Meta:
        model = Short
        fields = [
            'id', 
            'file_url', 
            'start_second', 
            'end_second', 
            'height', 
            'width', 
            'status',
            'created_at',
            'video',
            'covers'
        ]
        
    def get_covers(self, obj) -> List[Dict[str, Any]]:
        """
        Obtiene todas las portadas asociadas al short
        """
        covers = obj.short.all()
        return CoverSerializer(covers, many=True).data


class ErrorResponseSerializer(serializers.Serializer):
    """
    Serializer para respuestas de error estándar
    """
    detail = serializers.CharField(
        help_text="Mensaje descriptivo del error"
    )