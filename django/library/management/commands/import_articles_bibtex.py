from django.core.management.base import BaseCommand, CommandParser
from library.models import Article, Edition, Event, Author
import bibtexparser

class Command(BaseCommand):
    help = 'Import articles in bulk from a BibTeX file.'

    def add_arguments(self, parser: CommandParser):
        parser.add_argument('bibtex_path', type=str, help='Path to the BibTeX file')
        parser.add_argument('--edition', type=int, help='Edition year to associate articles with')
        parser.add_argument('--event', type=str, help='Event name to associate articles with')

    def handle(self, *args, **options):
        bibtex_path = options['bibtex_path']
        edition_year = options.get('edition')
        event_name = options.get('event')

        if not (edition_year and event_name):
            self.stderr.write(self.style.ERROR('You must specify both --edition and --event'))
            return

        event, _ = Event.objects.get_or_create(name=event_name)
        edition, _ = Edition.objects.get_or_create(event=event, year=edition_year)

        with open(bibtex_path, encoding='utf-8') as bibfile:
            bib_database = bibtexparser.load(bibfile)
            for entry in bib_database.entries:
                title = entry.get('title', '')
                abstract = entry.get('abstract', '')
                pdf_url = entry.get('url', '')
                authors_str = entry.get('author', '')
                bibtex = entry.get('ID', '')
                article = Article.objects.create(
                    title=title,
                    abstract=abstract,
                    pdf_url=pdf_url,
                    edition=edition,
                    bibtex=bibtex
                )
                for author_name in authors_str.split(' and '):
                    author_name = author_name.strip()
                    if author_name:
                        author, _ = Author.objects.get_or_create(name=author_name)
                        article.authors.add(author)
                self.stdout.write(self.style.SUCCESS(f'Imported: {title}'))
        self.stdout.write(self.style.SUCCESS('BibTeX import completed.'))
