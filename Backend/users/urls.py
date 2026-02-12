from django.urls import path
from . import views

app_name = 'users'

# TODO: Implementar endpoints de usuarios
# Template para cuando agreguen endpoints:

urlpatterns = [
    # Ejemplos de endpoints a implementar:
    # path('register/', views.UserRegisterView.as_view(), name='user-register'),
    # path('login/', views.UserLoginView.as_view(), name='user-login'),
    # path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    # path('logout/', views.UserLogoutView.as_view(), name='user-logout'),
]

# Documentación para developers:
# 1. Crear serializers en users/serializers.py
# 2. Implementar views con @extend_schema decorators  
# 3. Usar tag 'Users' en la documentación
# 4. Seguir pattern de shorts/views.py para consistency
# 5. Considerar usar Django REST Framework authentication