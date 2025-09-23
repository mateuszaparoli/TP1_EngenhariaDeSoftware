from django.core.management.base import BaseCommand, CommandParser
from library.models import Event, Edition, Author, Article
import csv
import os

class Command(BaseCommand):
    help = 'Import articles from a CSV file (as exported by the scraper)'

    def add_arguments(self, parser: CommandParser):
        parser.add_argument('csv_path', type=str, help='Path to the CSV file')
        parser.add_argument('--edition', type=int, help='Edition year to associate articles with')
        parser.add_argument('--event', type=str, help='Event name to associate articles with')

    def handle(self, *args, **options):
        csv_path = options['csv_path']
        edition_year = options.get('edition')
        event_name = options.get('event')

        if not os.path.exists(csv_path):
            self.stderr.write(self.style.ERROR(f'File not found: {csv_path}'))
            return

        if not (edition_year and event_name):
            self.stderr.write(self.style.ERROR('You must specify both --edition and --event'))
            return

        event, _ = Event.objects.get_or_create(name=event_name)
        edition, _ = Edition.objects.get_or_create(event=event, year=edition_year)

        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                title = row.get('title')
                abstract = row.get('abstract', '')
                pdf_url = row.get('pdf_url', '')
                authors_str = row.get('authors', '')
                bibtex = row.get('bibtex', '')
                article = Article.objects.create(
                    title=title,
                    abstract=abstract,
                    pdf_url=pdf_url,
                    edition=edition,
                    bibtex=bibtex
                )
                for author_name in authors_str.split(';'):
                    author_name = author_name.strip()
                    if author_name:
                        author, _ = Author.objects.get_or_create(name=author_name)
                        article.authors.add(author)
                self.stdout.write(self.style.SUCCESS(f'Imported: {title}'))
        self.stdout.write(self.style.SUCCESS('Import completed.'))
