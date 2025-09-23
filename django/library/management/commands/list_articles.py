from django.core.management.base import BaseCommand, CommandParser
from library.models import Event, Edition, Author, Article

class Command(BaseCommand):
    help = 'List all articles, optionally filtered by title, author, or event.'

    def add_arguments(self, parser: CommandParser):
        parser.add_argument('--title', type=str, help='Filter by article title')
        parser.add_argument('--author', type=str, help='Filter by author name')
        parser.add_argument('--event', type=str, help='Filter by event name')

    def handle(self, *args, **options):
        articles = Article.objects.all()
        if options['title']:
            articles = articles.filter(title__icontains=options['title'])
        if options['author']:
            articles = articles.filter(authors__name__icontains=options['author'])
        if options['event']:
            articles = articles.filter(edition__event__name__icontains=options['event'])
        articles = articles.distinct()
        for article in articles:
            authors = ', '.join(a.name for a in article.authors.all())
            self.stdout.write(f"{article.title} | {authors} | {article.edition.event.name} {article.edition.year}")
        if not articles:
            self.stdout.write('No articles found.')
