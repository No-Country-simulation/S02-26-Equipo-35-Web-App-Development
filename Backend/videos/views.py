from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Video

# Create your views here.
class VideoView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            
            video = Video.objects.create(
                file_name = request.data.get('file_name'),
                file_url = request.data.get('file_url'),
                duration_seconds = request.data.get('duration_seconds'),
                status = 'uploaded',
                short_requested = request.data.get('short_requested'),
                width = request.data.get('width'),
                height = request.data.get('height'),
                aspect_ratio = request.data.get('aspect_ratio'),
                file_size = request.data.get('file_size'),
                user = request.user
            )
            
            return Response(
                {"message": "done", "video_id": video.id },
                status = status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": "Error ", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )