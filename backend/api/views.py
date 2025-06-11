from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from .models import Clipping, Book, Author
from .serializers import ClippingSerializer, BookSerializer, AuthorSerializer



class ClippingListView(ListAPIView):
    queryset = Clipping.objects.select_related('book__author').prefetch_related('highlight_content', 'note_content')
    serializer_class = ClippingSerializer
    
class AuthorsListView(ListAPIView):
    queryset = Author.objects.prefetch_related(
        'books',             # relacja do książek (zdefiniowana jako related_name='books' w Book)
    ).all()
    serializer_class = AuthorSerializer

    
    
class BookListAPIView(APIView):
    def get(self, request):
        books = Book.objects.select_related('author').all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)
    
class ClippingsByBookView(ListAPIView):
    serializer_class = ClippingSerializer

    def get_queryset(self):
        book_id = self.kwargs.get("book_id")
        return Clipping.objects.filter(book_id=book_id).select_related("book", "book__author").prefetch_related("highlight_content", "note_content")

class ClippingsByAuthorView(ListAPIView):
    serializer_class = ClippingSerializer

    def get_queryset(self):
        author_id = self.kwargs["author_id"]
        return Clipping.objects.filter(book__author__id=author_id)
