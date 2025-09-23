from django.core.management.base import BaseCommand, CommandParser
from library.models import Event, Edition

class Command(BaseCommand):
    help = 'Create or update an event and its edition.'

    def add_arguments(self, parser: CommandParser):
        parser.add_argument('event', type=str, help='Event name')
        parser.add_argument('year', type=int, help='Edition year')
        parser.add_argument('--location', type=str, default='', help='Edition location')
        parser.add_argument('--start_date', type=str, default='', help='Start date (YYYY-MM-DD)')
        parser.add_argument('--end_date', type=str, default='', help='End date (YYYY-MM-DD)')

    def handle(self, *args, **options):
        event, _ = Event.objects.get_or_create(name=options['event'])
        edition, created = Edition.objects.get_or_create(event=event, year=options['year'])
        edition.location = options['location']
        if options['start_date']:
            edition.start_date = options['start_date']
        if options['end_date']:
            edition.end_date = options['end_date']
        edition.save()
        self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'} edition: {event.name} {edition.year}"))
