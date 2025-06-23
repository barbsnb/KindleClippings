from rest_framework import serializers
from .models import Clipping, Author, Book, HighlightContent, NoteContent

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name']

class BookSerializer(serializers.ModelSerializer):
    # author = serializers.CharField(source='author.name')
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author']

class HighlightContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HighlightContent
        fields = ['text']

class NoteContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteContent
        fields = ['note']

class ClippingSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    author = AuthorSerializer(read_only=True) 
    
    highlight = serializers.SerializerMethodField()
    note = serializers.SerializerMethodField()
    time = serializers.DateTimeField(source='added_on', format="%Y-%m-%dT%H:%M:%SZ")  
    visibility = serializers.BooleanField()

    class Meta:
        model = Clipping
        fields = ['id', 'author', 'book', 'highlight', 'note', 'time', 'visibility']

    # def get_author(self, obj):
    #     author = obj.book.author
    #     return author.name if author else "Unknown"

    def get_highlight(self, obj):
        return obj.highlight_content.text if hasattr(obj, 'highlight_content') else None

    def get_note(self, obj):
        return obj.note_content.note if hasattr(obj, 'note_content') else None
    

        