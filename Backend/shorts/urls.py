from django.urls import path
from . import views

app_name = 'shorts'

urlpatterns = [
    path('', views.ShortListView.as_view(), name='short-list'),
    path('<int:short_id>/', views.get_short_detail, name='short-detail'),
]