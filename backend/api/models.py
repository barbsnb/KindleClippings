from django.db import models


class Author(models.Model):
    name = models.TextField(unique=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.TextField()
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name="books")

    class Meta:
        unique_together = ('title', 'author')

    def __str__(self):
        return f"{self.title} by {self.author.name}"
    
class Clipping(models.Model):
    CLIP_TYPES = [
        ('highlight', 'Highlight'),
        ('note', 'Note'),
        ('bookmark', 'Bookmark'),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="clippings")
    type = models.CharField(max_length=10, choices=CLIP_TYPES)
    location = models.TextField(blank=True)
    added_on = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.book.title} ({self.get_type_display()})"

class HighlightContent(models.Model):
    clipping = models.OneToOneField(Clipping, on_delete=models.CASCADE, related_name="highlight_content")
    text = models.TextField()

class NoteContent(models.Model):
    clipping = models.OneToOneField(Clipping, on_delete=models.CASCADE, related_name="note_content")
    note = models.TextField()

