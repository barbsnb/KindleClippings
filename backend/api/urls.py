from django.urls import path
from . import views

urlpatterns = [
    path('clippings/', views.ClippingListView.as_view(), name='clipping-list'),
    path('books/', views.BookListAPIView.as_view(), name='books'),
]