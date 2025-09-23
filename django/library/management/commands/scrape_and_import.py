from django.core.management.base import BaseCommand
import subprocess
import sys
import os

class Command(BaseCommand):
    help = 'Run the arXiv scraper and import results into the database.'

    def add_arguments(self, parser):
        parser.add_argument('--query', type=str, required=True, help='arXiv search query (e.g., "cat:cs.SE")')
        parser.add_argument('--max_results', type=int, default=100, help='Maximum number of results to fetch')
        parser.add_argument('--edition', type=int, required=True, help='Edition year to associate articles with')
        parser.add_argument('--event', type=str, required=True, help='Event name to associate articles with')
        parser.add_argument('--csv_path', type=str, default='scraper_output.csv', help='Temporary CSV output path')

    def handle(self, *args, **options):
        scraper_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../scraper.py'))
        csv_path = options['csv_path']
        query = options['query']
        max_results = options['max_results']
        # Run the scraper
        result = subprocess.run([
            sys.executable, scraper_path,
            '--query', query,
            '--max_results', str(max_results),
            '--output', csv_path
        ], capture_output=True, text=True)
        if result.returncode != 0:
            self.stderr.write(self.style.ERROR('Scraper failed:'))
            self.stderr.write(result.stderr)
            return
        self.stdout.write(self.style.SUCCESS('Scraper finished. Importing articles...'))
        # Import articles from CSV
        from django.core.management import call_command
        call_command('import_articles_csv', csv_path, '--edition', str(options['edition']), '--event', options['event'])
        self.stdout.write(self.style.SUCCESS('Scraping and import completed.'))
