from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'clippings', views.ClippingViewSet, basename='clipping')
router.register(r'authors', views.AuthorsViewSet, basename='authors')
router.register(r'books', views.BooksViewSet, basename='books')

urlpatterns = [
    path('', include(router.urls)),
    path("books/<int:book_id>/clippings/", views.ClippingsByBookView.as_view(), name="clippings-by-book"),
    path("authors/<int:author_id>/clippings/", views.ClippingsByAuthorView.as_view(), name="clippings-by-author"),
    path("stats/", views.StatsView.as_view(), name="stats-view"),
]