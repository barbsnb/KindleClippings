from rest_framework import serializers
from .models import Clipping, Author, Book, HighlightContent, NoteContent, Tag

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
        
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ClippingSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    # author = AuthorSerializer(read_only=True) 
    author = AuthorSerializer(source='book.author', read_only=True)

    
    highlight = serializers.SerializerMethodField()
    note = serializers.SerializerMethodField()
    time = serializers.DateTimeField(source='added_on', format="%Y-%m-%dT%H:%M:%SZ")  
    visibility = serializers.BooleanField()
    favourite = serializers.BooleanField()
    tags = TagSerializer(many=True, required=False)

    class Meta:
        model = Clipping
        fields = ['id', 'author', 'book', 'highlight', 'note', 'time', 'visibility', 'favourite', 'tags']

    def get_highlight(self, obj):
        return obj.highlight_content.text if hasattr(obj, 'highlight_content') else None

    def get_note(self, obj):
        return obj.note_content.note if hasattr(obj, 'note_content') else None
    
    def create(self, validated_data):
        tags_data = self.initial_data.get('tags', [])
        clipping = super().create(validated_data)
        self._set_tags(clipping, tags_data)
        return clipping

    def update(self, instance, validated_data):
        tags_data = self.initial_data.get('tags', [])
        instance = super().update(instance, validated_data)
        if tags_data is not None:
            self._set_tags(instance, tags_data)
        return instance

    def _set_tags(self, clipping, tags_data):
        from .models import Tag  # local import to avoid circular issues
        tag_objs = []

        for tag in tags_data:
            if isinstance(tag, dict):
                name = tag.get("name")
            else:
                name = tag
            if name:
                tag_obj, _ = Tag.objects.get_or_create(name=name)
                tag_objs.append(tag_obj)

        clipping.tags.set(tag_objs)
    

        