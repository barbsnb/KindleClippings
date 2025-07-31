import subprocess
from django.core.management.base import BaseCommand
from .import_clippings import KindleClippingParser 

class KindleClippingDiffParser:
    def __init__(self, diff_text):
        self.diff_text = diff_text
        self.parsed_clippings = []
        self.latest_imported_clippings = []

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
        repo_root = "C:/Users/barba/OneDrive/Dokumenty/Bebidonek/"
        try:
            diff_output = subprocess.check_output(
                ["git", "diff", "--no-prefix", "HEAD", "--", filepath],
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                cwd=repo_root
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
        all_new = []

        for entry in entries:
            kparser = KindleClippingParser(entry)
            kparser.parse_all()
            saved = kparser.save_to_db()
            all_new.extend(saved)

        self.stdout.write(self.style.SUCCESS(f"Imported {len(all_new)} new clippings from git diff"))
        self.latest_imported_clippings = all_new