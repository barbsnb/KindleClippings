from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework import viewsets
from .models import Clipping, Book, Author
from .serializers import ClippingSerializer, BookSerializer, AuthorSerializer
from django.db.models import Count, Q

    
# Lists - authors and books
class AuthorsViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.prefetch_related('books').all()
    serializer_class = AuthorSerializer

class BooksViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('author').all()
    serializer_class = BookSerializer

# Clippings lists:    
class ClippingViewSet(viewsets.ModelViewSet):
    serializer_class = ClippingSerializer
    
    def get_queryset(self):
        visibility_param = self.request.query_params.get('visibility')
        
        if visibility_param is None:
            # Default - true
            return Clipping.objects.filter(visibility=True)

        if visibility_param.lower() == 'false':
            return Clipping.objects.filter(visibility=False)

        return Clipping.objects.filter(visibility=True)
    
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
    
    
# stats:
class StatsView(APIView):
    def get(self, request):
        # Najwięcej highlightów (po książkach)
        top_book = (
            Book.objects.annotate(
                highlight_count=Count(
                    'clippings',
                    filter=Q(
                        clippings__type='highlight',
                        clippings__highlight_content__isnull=False
                    )
                )
            )
            .order_by('-highlight_count')
            .first()
        )

        # Najwięcej notatek (po autorach)
        top_author = (
            Author.objects.annotate(
                note_count=Count(
                    'books__clippings',
                    filter=Q(
                        books__clippings__type='note',
                        books__clippings__note_content__isnull=False
                    )
                )
            )
            .order_by('-note_count')
            .first()
        )

        return Response({
            "top_book": {
                "title": top_book.title if top_book else None,
                "author": top_book.author.name if top_book else None,
                "highlight_count": top_book.highlight_count if top_book else 0
            },
            "top_author": {
                "name": top_author.name if top_author else None,
                "note_count": top_author.note_count if top_author else 0
            }
        })
        
