from django.core.management.base import BaseCommand
from library.models import Author
from django.core.mail import send_mail
from django.conf import settings

class Command(BaseCommand):
    help = 'Notify users (authors) by email when a new article is available (simulated).' 

    def add_arguments(self, parser):
        parser.add_argument('--author', type=str, help='Author name to notify (simulated)')
        parser.add_argument('--article', type=str, help='Article title (simulated)')

    def handle(self, *args, **options):
        author_name = options.get('author')
        article_title = options.get('article')
        if not (author_name and article_title):
            self.stderr.write('Specify both --author and --article')
            return
        # Simulate notification (print to stdout)
        self.stdout.write(f"Simulated email: Notifying {author_name} about new article '{article_title}'")
