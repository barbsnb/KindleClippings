from django.urls import path
from . import views

urlpatterns = [
    path('clippings/', views.ClippingListView.as_view(), name='clipping-list'),
    path('books/', views.BookListAPIView.as_view(), name='books'),
    path("books/<int:book_id>/clippings/", views.ClippingsByBookView.as_view(), name="clippings-by-book"),
    path("authors/", views.AuthorsListView.as_view(), name="authors"),
    path("authors/<int:author_id>/clippings/", views.ClippingsByAuthorView.as_view(), name="clippings-by-author"),
]