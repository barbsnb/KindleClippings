import re
from datetime import datetime
from django.core.management.base import BaseCommand
from api.models import Author, Book, Clipping, HighlightContent, NoteContent
from django.utils import timezone


class KindleClippingParser:
    def __init__(self, raw_text):
        self.raw_text = raw_text
        self.parsed_clippings = []

    def parse_all(self):
        entries = self.raw_text.split("==========")
        last_highlight = None

        for entry in entries:
            entry = entry.strip()
            if not entry:
                continue

            parsed = self.parse_entry(entry)
            if not parsed:
                continue

            if parsed["type"] == "highlight":
                self.parsed_clippings.append(parsed)
                last_highlight = parsed

            elif parsed["type"] == "note":
                # Do we have a highlight nearby?
                if last_highlight and self._locations_match(parsed["location"], last_highlight["location"]):
                    last_highlight["note"] = parsed["text"]  # ← podpinamy note
                else:
                    # fallback: create as separate note
                    self.parsed_clippings.append(parsed)

        return self.parsed_clippings
    
    def _locations_match(self, note_loc, highlight_loc):
        try:
            note_start = int(note_loc.split('-')[0])
            hl_parts = highlight_loc.split('-')
            hl_start = int(hl_parts[0])
            hl_end = int(hl_parts[-1])  

            return abs(note_start - hl_end) <= 2
        except:
            return False


    def parse_entry(self, entry):
        # Example entry:
        # Faust (von Goethe, Johann Wolfgang)
        # - Your Highlight on page 145 | location 1730-1732 | Added on Sunday, 28 December 2014 19:02:23
        #
        # Ah, that simplicity and innocence ne'er know Themselves, their holy value, and their spell! That meekness, lowliness, the highest graces Which Nature portions out so lovingly—

        lines = entry.splitlines()
        if len(lines) < 3:
            return None

        # First line: title and author, e.g. "Faust (von Goethe, Johann Wolfgang)"
        title_author_line = lines[0].strip()
        title, author = self.extract_title_author(title_author_line)

        # Second line: metadata, e.g. "- Your Highlight on page 145 | location 1730-1732 | Added on Sunday, 28 December 2014 19:02:23"
        meta_line = lines[1].strip()
        clip_type, location, added_on = self.extract_metadata(meta_line)

        # The rest is the text content (highlight or note)
        content_lines = lines[2:]
        text = "\n".join(content_lines).strip()

        return {
            "title": title,
            "author": author,
            "type": clip_type,
            "location": location,
            "added_on": added_on,
            "text": text,
        }

    def extract_title_author(self, line):
        # Example: "Faust (von Goethe, Johann Wolfgang)"
        # Separate title and author inside parentheses
        match = re.match(r"^(.*?)\s*\((.*?)\)$", line)
        if match:
            title = match.group(1).strip()
            author = match.group(2).strip()
        else:
            title = line
            author = ""
        return title, author

    def extract_metadata(self, line):
        # Determine type: Highlight, Note, Bookmark
        clip_type = None
        if "Highlight" in line:
            clip_type = "highlight"
        elif "Note" in line:
            clip_type = "note"
        elif "Bookmark" in line:
            clip_type = "bookmark"
        else:
            clip_type = "unknown"

        # Extract location info, e.g. "location 1730-1732"
        location_match = re.search(r"location ([\d\-]+)", line)
        location = location_match.group(1) if location_match else ""

        # Extract date, e.g. "Added on Sunday, 28 December 2014 19:02:23"
        date_match = re.search(r"Added on (.+)$", line)
        added_on = None
        if date_match:
            date_str = date_match.group(1).strip()
            try:
                naive = datetime.strptime(date_str, "%A, %d %B %Y %H:%M:%S")
                added_on = timezone.make_aware(naive, timezone.get_current_timezone())
            except ValueError:
                added_on = None

        return clip_type, location, added_on

    def save_to_db(self):
        saved = []
        for clip in self.parsed_clippings:
            if clip["type"] == "bookmark":
                continue

            author_obj, _ = Author.objects.get_or_create(name=clip["author"])
            book_obj, _ = Book.objects.get_or_create(title=clip["title"], author=author_obj)

            clipping, created = Clipping.objects.get_or_create(
                book=book_obj,
                type=clip["type"],
                location=clip["location"],
                defaults={"added_on": clip["added_on"]},
            )

            if clip["type"] == "highlight":
                HighlightContent.objects.update_or_create(
                    clipping=clipping,
                    defaults={"text": clip["text"]}
                )
                if "note" in clip:
                    NoteContent.objects.update_or_create(
                        clipping=clipping,
                        defaults={"note": clip["note"]}
                    )
            elif clip["type"] == "note":
                NoteContent.objects.update_or_create(
                    clipping=clipping,
                    defaults={"note": clip["text"]}
                )

            if created:
                saved.append({
                    "book": book_obj.title,
                    "author": author_obj.name,
                    "text": clip["text"],
                    "type": clip["type"],
                    "added_on": clip["added_on"],
                })
        
        return saved


class Command(BaseCommand):
    help = 'Import Kindle clippings from a specified file'

    def add_arguments(self, parser):
        parser.add_argument('filepath', type=str, help='Path to the clippings text file')

    def handle(self, *args, **options):
        filepath = options['filepath']
        self.stdout.write(f"Importing clippings from: {filepath}")

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                raw_text = f.read()
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File not found: {filepath}"))
            return

        parser = KindleClippingParser(raw_text)
        parser.parse_all()
        count = parser.save_to_db()

        self.stdout.write(self.style.SUCCESS(f"Imported {count} clippings"))
