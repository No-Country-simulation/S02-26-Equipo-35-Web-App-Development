from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Video
from .serializer import VideoSerializer

# Create your views here.
class VideoView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = VideoSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(user=request.user) 
            return Response(
                {
                    "message": "done",
                    "video_id": serializer.data["id"]
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
            

       
            
            