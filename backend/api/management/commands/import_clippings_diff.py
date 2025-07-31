import subprocess
from django.core.management.base import BaseCommand
from .import_clippings import KindleClippingParser 

class KindleClippingDiffParser:
    def __init__(self, diff_text):
        self.diff_text = diff_text
        self.parsed_clippings = []

    def extract_new_entries(self):
        lines = self.diff_text.splitlines()
        added_lines = [
            line[1:] for line in lines if line.startswith("+") and not line.startswith("+++")
        ]
        text = "\n".join(added_lines)
        entries = text.split("==========")
        for entry in entries:
            entry = entry.strip()
            if entry:
                self.parsed_clippings.append(entry)
        return self.parsed_clippings


class Command(BaseCommand):
    help = 'Import only newly added Kindle clippings using git diff'

    def add_arguments(self, parser):
        parser.add_argument('filepath', type=str, help='Path to the clippings file (inside git repo)')

    def handle(self, *args, **options):
        filepath = options['filepath']

        # Generate git diff
        try:
            diff_output = subprocess.check_output(
                ["git", "diff", "--no-prefix", "HEAD", "--", filepath],
                stderr=subprocess.STDOUT,
                universal_newlines=True
            )
            print(diff_output)
        except subprocess.CalledProcessError as e:
            self.stderr.write(self.style.ERROR(f"Git diff failed: {e.output}"))
            return

        if not diff_output.strip():
            self.stdout.write(self.style.WARNING("No new clippings found in diff."))
            return

        parser = KindleClippingDiffParser(diff_output)
        entries = parser.extract_new_entries()

        if not entries:
            self.stdout.write(self.style.WARNING("No new clippings parsed."))
            return

        imported_count = 0

        for entry in entries:
            kparser = KindleClippingParser(entry)
            parsed = kparser.parse_all()
            imported_count += kparser.save_to_db()

        self.stdout.write(self.style.SUCCESS(f"Imported {imported_count} new clippings from git diff"))
