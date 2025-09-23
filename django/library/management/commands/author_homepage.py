from django.core.management.base import BaseCommand, CommandParser
from library.models import Article, Author

class Command(BaseCommand):
    help = 'Create a homepage for a specific author, listing their articles by year.'

    def add_arguments(self, parser: CommandParser):
        parser.add_argument('author', type=str, help='Author name')

    def handle(self, *args, **options):
        author_name = options['author']
        try:
            author = Author.objects.get(name=author_name)
        except Author.DoesNotExist:
            self.stderr.write(f'Author not found: {author_name}')
            return
        articles = author.articles.all().order_by('edition__year')
        self.stdout.write(f'Homepage for {author.name}:')
        for article in articles:
            self.stdout.write(f'- {article.title} ({article.edition.year})')
