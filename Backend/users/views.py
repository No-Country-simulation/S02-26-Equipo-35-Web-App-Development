from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from drf_yasg.utils import no_body


from .serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    ProfileImageSerializer,
)

User = get_user_model()


class AuthViewSet(viewsets.GenericViewSet):

    serializer_action_classes = {
        "register": UserRegisterSerializer,
        "login": UserLoginSerializer,
        "profile": UserProfileSerializer,
        "update_image": ProfileImageSerializer,
    }

    parser_classes = [MultiPartParser, FormParser]

    # 🔥 Serializer dinámico
    def get_serializer_class(self):
        return self.serializer_action_classes.get(
            self.action,
            UserProfileSerializer,  # fallback seguro
        )

    # 🔥 Permisos dinámicos
    def get_permissions(self):
        if self.action in ["register", "login"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    # ---------------- REGISTER ----------------

    @swagger_auto_schema(
        request_body=UserRegisterSerializer,
        responses={201: UserProfileSerializer},
        operation_summary="Registrar usuario",
        operation_description="Crea un usuario nuevo y devuelve el token.",
    )
    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "token": token.key,
            },
            status=status.HTTP_201_CREATED,
        )

    # ---------------- IMAGE ----------------

    @swagger_auto_schema(
        method="patch",
        request_body=ProfileImageSerializer,
        operation_summary="Actualizar imagen de perfil",
    )
    @action(detail=False, methods=["patch"])
    def update_image(self, request):

        user = request.user

        # 🔥 borrar imagen anterior
        if user.profile_image:
            user.profile_image.delete(save=False)

        serializer = self.get_serializer(user, data=request.data, partial=True)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    @swagger_auto_schema(
        method="delete",
        operation_summary="Eliminar imagen de perfil",
    )
    @action(detail=False, methods=["delete"])
    def delete_image(self, request):

        user = request.user

        if user.profile_image:
            user.profile_image.delete(save=False)

        user.profile_image = None
        user.save()

        return Response(
            {"detail": "Imagen eliminada"},
            status=status.HTTP_200_OK,
        )

    # ---------------- LOGIN ----------------

    @swagger_auto_schema(
        request_body=UserLoginSerializer,
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "user": openapi.Schema(type=openapi.TYPE_OBJECT),
                    "token": openapi.Schema(type=openapi.TYPE_STRING),
                },
            )
        },
        operation_summary="Login",
        operation_description="Autentica al usuario y devuelve el token.",
    )
    @action(detail=False, methods=["post"])
    def login(self, request):
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "token": token.key,
            }
        )

    # ---------------- LOGOUT ----------------

    @swagger_auto_schema(
        request_body=no_body,
        operation_summary="Logout",
        operation_description="Elimina el token del usuario autenticado.",
        responses={200: "Sesión cerrada"},
    )
    @action(detail=False, methods=["post"])
    def logout(self, request):
        if request.auth:
            request.auth.delete()

        return Response({"detail": "Sesión cerrada"}, status=status.HTTP_200_OK)

    # ---------------- PROFILE ----------------

    @swagger_auto_schema(
        method="get",
        operation_summary="Obtener perfil",
        responses={200: UserProfileSerializer},
    )
    @swagger_auto_schema(
        method="put",
        request_body=UserProfileSerializer,
        operation_summary="Actualizar perfil",
        responses={200: UserProfileSerializer},
    )
    @swagger_auto_schema(
        method="patch",
        request_body=UserProfileSerializer,
        operation_summary="Actualizar parcialmente el perfil",
        responses={200: UserProfileSerializer},
    )
    @action(detail=False, methods=["get", "put", "patch"])
    def profile(self, request):

        if request.method == "GET":
            return Response(self.get_serializer(request.user).data)

        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=request.method == "PATCH",
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
