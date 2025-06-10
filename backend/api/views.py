from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from .models import Clipping, Book
from .serializers import ClippingSerializer, BookSerializer



class ClippingListView(ListAPIView):
    queryset = Clipping.objects.select_related('book__author').prefetch_related('highlight_content', 'note_content')
    serializer_class = ClippingSerializer
    
    
class BookListAPIView(APIView):
    def get(self, request):
        books = Book.objects.select_related('author').all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)