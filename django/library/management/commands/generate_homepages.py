from django.core.management.base import BaseCommand
from library.models import Event, Edition, Article, Author

class Command(BaseCommand):
    help = 'Generate simple homepages for events, editions, and authors (prints to stdout for now).'

    def handle(self, *args, **options):
        self.stdout.write('Events:')
        for event in Event.objects.all():
            self.stdout.write(f'- {event.name}')
            for edition in event.editions.all():
                self.stdout.write(f'  - Edition {edition.year} ({edition.location})')
                for article in edition.articles.all():
                    authors = ', '.join(a.name for a in article.authors.all())
                    self.stdout.write(f'    - {article.title} | {authors}')
        self.stdout.write('\nAuthors:')
        for author in Author.objects.all():
            self.stdout.write(f'- {author.name}')
            for article in author.articles.all():
                self.stdout.write(f'  - {article.title} ({article.edition.event.name} {article.edition.year})')
