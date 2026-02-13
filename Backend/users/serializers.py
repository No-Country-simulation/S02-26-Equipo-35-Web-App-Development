from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este email.")
        return value.lower()

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Las contraseñas no coinciden"}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user


class ProfileImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["profile_image"]

    def validate_profile_image(self, value):

        max_size = 3 * 1024 * 1024  # 3MB

        if value.size > max_size:
            raise serializers.ValidationError("La imagen no puede superar 3MB")

        return value


# -----------------------------


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        request = self.context.get("request")

        user = authenticate(
            request=request,
            username=attrs["username"],
            password=attrs["password"],
        )

        if not user:
            raise serializers.ValidationError("Usuario o contraseña incorrectos")

        if not user.is_active:
            raise serializers.ValidationError("Usuario deshabilitado.")

        attrs["user"] = user
        return attrs


# -----------------------------


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile_image",
            "created_at",
        ]
        read_only_fields = ["id", "username", "created_at", "email"]
