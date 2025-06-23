from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework import viewsets, filters
from .models import Clipping, Book, Author, Tag
from .serializers import ClippingSerializer, BookSerializer, AuthorSerializer, TagSerializer
from django.db.models import Count, Q

    
# Lists - authors, books and tags
class AuthorsViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.prefetch_related('books').all()
    serializer_class = AuthorSerializer

class BooksViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('author').all()
    serializer_class = BookSerializer
    
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    #/api/tags/?search=abc

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
    
    @action(detail=True, methods=['get'])
    def tags(self, request, pk=None):
        clipping = self.get_object()
        tags = clipping.tags.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)
    # GET /api/clippings/<id>/tags/
    
    @action(detail=True, methods=['post'])
    def add_tag(self, request, pk=None):
        clipping = self.get_object()
        tag_name = request.data.get('name', '').strip()
        
        if not tag_name:
            return Response({'error': 'Tag name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        tag, created = Tag.objects.get_or_create(name=tag_name)
        clipping.tags.add(tag)
        clipping.save()
        
        serializer = self.get_serializer(clipping)
        return Response(serializer.data, status=status.HTTP_200_OK)
    # POST /api/clippings/<id>/add_tag/
    
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
        
