from django.core.management.base import BaseCommand, CommandParser
from library.models import Article, Edition, Event, Author

class Command(BaseCommand):
    help = 'Manually add an article, including its PDF URL.'

    def add_arguments(self, parser: CommandParser):
        parser.add_argument('title', type=str, help='Article title')
        parser.add_argument('--abstract', type=str, default='', help='Article abstract')
        parser.add_argument('--pdf_url', type=str, default='', help='PDF URL')
        parser.add_argument('--authors', type=str, default='', help='Authors (separated by ";")')
        parser.add_argument('--edition', type=int, required=True, help='Edition year')
        parser.add_argument('--event', type=str, required=True, help='Event name')
        parser.add_argument('--bibtex', type=str, default='', help='BibTeX entry')

    def handle(self, *args, **options):
        event, _ = Event.objects.get_or_create(name=options['event'])
        edition, _ = Edition.objects.get_or_create(event=event, year=options['edition'])
        article = Article.objects.create(
            title=options['title'],
            abstract=options['abstract'],
            pdf_url=options['pdf_url'],
            edition=edition,
            bibtex=options['bibtex']
        )
        for author_name in options['authors'].split(';'):
            author_name = author_name.strip()
            if author_name:
                author, _ = Author.objects.get_or_create(name=author_name)
                article.authors.add(author)
        self.stdout.write(self.style.SUCCESS(f'Article added: {article.title}'))
