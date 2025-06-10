from rest_framework import serializers
from .models import Clipping, Author, Book, HighlightContent, NoteContent

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['name']

class BookSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.name')

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
    author = serializers.SerializerMethodField()
    book = serializers.CharField(source='book.title')
    highlight = serializers.SerializerMethodField()
    note = serializers.SerializerMethodField()
    time = serializers.DateTimeField(source='added_on', format="%Y-%m-%dT%H:%M:%SZ")  

    class Meta:
        model = Clipping
        fields = ['id', 'author', 'book', 'highlight', 'note', 'time']

    def get_author(self, obj):
        author = obj.book.author
        return author.name if author else "Unknown"

    def get_highlight(self, obj):
        return obj.highlight_content.text if hasattr(obj, 'highlight_content') else None

    def get_note(self, obj):
        return obj.note_content.note if hasattr(obj, 'note_content') else None

        