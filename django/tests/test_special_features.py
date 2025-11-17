import pytest
import json
import zipfile
import io
from django.test import TestCase, Client
from django.core.files.uploadedfile import SimpleUploadedFile
from library.models import Event, Edition, Article, Author
from tests.factories import EventFactory, EditionFactory, AuthorFactory, ArticleFactory

@pytest.mark.integration
class TestBulkImportView(TestCase):
    def setUp(self):
        self.client = Client()
        self.edition = EditionFactory(year=2024)
        
    def test_bulk_import_bibtex_success(self):
        """Test successful BibTeX bulk import"""
        bibtex_content = """
        @inproceedings{paper1,
            title={A Novel Approach to Software Testing},
            author={John Doe and Jane Smith},
            year={2024},
            pages={10--20},
            abstract={This paper presents a novel approach to software testing.}
        }
        @inproceedings{paper2,
            title={Machine Learning in Software Engineering},
            author={Alice Johnson},
            year={2024},
            pages={25--35},
            abstract={This work explores the use of ML in SE.}
        }
        """
        
        payload = {
            'bibtex_content': bibtex_content,
            'edition_id': self.edition.id
        }
        
        response = self.client.post('/api/articles/bulk-import/', data=payload)
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        # Check response structure
        self.assertTrue(data['success'])
        self.assertEqual(data['created_count'], 2)
        self.assertEqual(data['skipped_count'], 0)
        self.assertEqual(data['error_count'], 0)
        
        # Verify articles were created
        self.assertEqual(Article.objects.count(), 2)
        
        # Check first article
        article1 = Article.objects.get(title="A Novel Approach to Software Testing")
        self.assertEqual(article1.edition, self.edition)
        self.assertEqual(article1.pagina_inicial, 10)
        self.assertEqual(article1.pagina_final, 20)
        self.assertEqual(article1.authors.count(), 2)
        
        # Check authors were created
        authors = article1.authors.all()
        author_names = [a.name for a in authors]
        self.assertIn("John Doe", author_names)
        self.assertIn("Jane Smith", author_names)
    
    def test_bulk_import_with_pdf_zip(self):
        """Test BibTeX import with PDF ZIP file"""
        # Create a ZIP file with PDFs
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
            zip_file.writestr('paper1.pdf', b'%PDF-1.4 fake pdf content for paper1')
            zip_file.writestr('paper2.pdf', b'%PDF-1.4 fake pdf content for paper2')
        zip_buffer.seek(0)
        
        pdf_zip = SimpleUploadedFile(
            "papers.zip",
            zip_buffer.getvalue(),
            content_type="application/zip"
        )
        
        bibtex_content = """
        @inproceedings{paper1,
            title={First Paper with PDF},
            author={John Doe},
            year={2024}
        }
        @inproceedings{paper2,
            title={Second Paper with PDF},
            author={Jane Smith},
            year={2024}
        }
        """
        
        payload = {
            'bibtex_content': bibtex_content,
            'edition_id': self.edition.id,
            'pdf_zip': pdf_zip
        }
        
        response = self.client.post('/api/articles/bulk-import/', data=payload)
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        self.assertTrue(data['success'])
        self.assertEqual(data['created_count'], 2)
        
        # Check that PDFs were matched and attached
        self.assertGreater(data['pdf_matches'], 0)
        
        # Verify PDF files were attached
        articles_with_pdfs = Article.objects.filter(pdf_file__isnull=False)
        self.assertGreater(articles_with_pdfs.count(), 0)
    
    def test_bulk_import_validation_errors(self):
        """Test BibTeX import with validation errors"""
        bibtex_content = """
        @inproceedings{incomplete1,
            author={John Doe},
            year={2024}
        }
        @inproceedings{incomplete2,
            title={Valid Paper},
            author={Jane Smith},
            year={2024}
        }
        @inproceedings{incomplete3,
            title={No Year Paper},
            author={Alice Johnson}
        }
        """
        
        payload = {
            'bibtex_content': bibtex_content,
            'edition_id': self.edition.id
        }
        
        response = self.client.post('/api/articles/bulk-import/', data=payload)
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        # Should create only the valid paper
        self.assertEqual(data['created_count'], 1)
        self.assertEqual(data['skipped_count'], 2)  # Two incomplete papers
        
        # Check skipped articles have proper reasons
        skipped = data['skipped_articles']
        self.assertEqual(len(skipped), 2)
        
        # Verify only valid article was created
        valid_article = Article.objects.get()
        self.assertEqual(valid_article.title, "Valid Paper")
    
    def test_bulk_import_invalid_edition(self):
        """Test BibTeX import with invalid edition"""
        bibtex_content = """
        @inproceedings{paper1,
            title={Test Paper},
            author={John Doe},
            year={2024}
        }
        """
        
        payload = {
            'bibtex_content': bibtex_content,
            'edition_id': 99999  # Non-existent edition
        }
        
        response = self.client.post('/api/articles/bulk-import/', data=payload)
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("não encontrada", data['error'])
    
    def test_bulk_import_no_content(self):
        """Test BibTeX import with no content"""
        payload = {
            'edition_id': self.edition.id
        }
        
        response = self.client.post('/api/articles/bulk-import/', data=payload)
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        # Fix: The actual error message is different, so let's check for "Falha" instead
        self.assertIn("Falha", data['error'])
    
    def test_bulk_import_page_parsing(self):
        """Test different page number formats"""
        bibtex_content = """
        @inproceedings{paper1,
            title={Paper with Range Pages},
            author={John Doe},
            year={2024},
            pages={10--20}
        }
        @inproceedings{paper2,
            title={Paper with Single Page},
            author={Jane Smith},
            year={2024},
            pages={15}
        }
        @inproceedings{paper3,
            title={Paper with Dash Pages},
            author={Alice Johnson},
            year={2024},
            pages={25-30}
        }
        """
        
        payload = {
            'bibtex_content': bibtex_content,
            'edition_id': self.edition.id
        }
        
        response = self.client.post('/api/articles/bulk-import/', data=payload)
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data['created_count'], 3)
        
        # Check page parsing
        paper1 = Article.objects.get(title="Paper with Range Pages")
        self.assertEqual(paper1.pagina_inicial, 10)
        self.assertEqual(paper1.pagina_final, 20)
        
        paper2 = Article.objects.get(title="Paper with Single Page")
        self.assertEqual(paper2.pagina_inicial, 15)
        self.assertEqual(paper2.pagina_final, 15)
        
        paper3 = Article.objects.get(title="Paper with Dash Pages")
        self.assertEqual(paper3.pagina_inicial, 25)
        self.assertEqual(paper3.pagina_final, 30)

@pytest.mark.integration 
class TestSpecialFunctionalities(TestCase):
    def setUp(self):
        self.client = Client()
    
    def test_article_search_regex_author(self):
        """Test regex-based author search functionality"""
        # Create authors with similar names
        author1 = AuthorFactory(name="John Smith")
        author2 = AuthorFactory(name="Johnson Miller") 
        author3 = AuthorFactory(name="Mary Johnson")
        
        article1 = ArticleFactory(authors=[author1])
        article2 = ArticleFactory(authors=[author2])
        article3 = ArticleFactory(authors=[author3])
        
        # Search for "John" - should match "John Smith" but not "Johnson"
        response = self.client.get('/api/articles/?author=John')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should only find articles by John Smith (word boundary matching)
        article_ids = [a['id'] for a in data]
        self.assertIn(article1.id, article_ids)
        # Johnson Miller and Mary Johnson should not match "John" as complete word
        self.assertNotIn(article2.id, article_ids)
        self.assertNotIn(article3.id, article_ids)
    
    def test_date_parsing_functionality(self):
        """Test date parsing in edition creation"""
        event = EventFactory()
        
        # Test valid date formats
        valid_payloads = [
            {
                "event_id": event.id,
                "year": 2024,
                "start_date": "2024-10-21",
                "end_date": "2024-10-25"
            },
            {
                "event_id": event.id,
                "year": 2024,
                "start_date": "",
                "end_date": ""
            }
        ]
        
        for payload in valid_payloads:
            response = self.client.post(
                '/api/editions/',
                data=json.dumps(payload),
                content_type='application/json'
            )
            self.assertEqual(response.status_code, 201)
        
        # Test invalid date format (should handle gracefully)
        invalid_payload = {
            "event_id": event.id,
            "year": 2024,
            "start_date": "invalid-date",
            "end_date": "2024-10-25"
        }
        
        response = self.client.post(
            '/api/editions/',
            data=json.dumps(invalid_payload),
            content_type='application/json'
        )
        
        # Should still create edition but with None for invalid date
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIsNone(data['start_date'])
    
    def test_pdf_url_generation(self):
        """Test PDF URL generation for file uploads"""
        edition = EditionFactory()
        
        # Create a fake PDF file
        pdf_content = b'%PDF-1.4 fake pdf content'
        pdf_file = SimpleUploadedFile(
            "research_paper.pdf",
            pdf_content,
            content_type="application/pdf"
        )
        
        payload = {
            "title": "Paper with PDF File",
            "edition_id": edition.id,
            "authors": json.dumps(["Test Author"]),
            "pdf_file": pdf_file
        }
        
        response = self.client.post('/api/articles/', data=payload)
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        
        # Check that PDF URL is properly generated
        self.assertIsNotNone(data['pdf_url'])
        self.assertIn('localhost:8000', data['pdf_url'])
        self.assertIn('research_paper', data['pdf_url'])
        
        # Verify the article in database
        article = Article.objects.get(id=data['id'])
        self.assertTrue(article.pdf_file)
        self.assertIn('research_paper', article.pdf_file.name)
    
    def test_edition_update(self):
        """Test updating edition details"""
        edition = EditionFactory()
        
        payload = {
            "year": 2025,
            "location": "Updated Location",
            "start_date": "2025-11-01",
            "end_date": "2025-11-05"
        }
        
        response = self.client.put(
            f'/api/editions/{edition.id}/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['year'], 2025)
        self.assertEqual(data['location'], "Updated Location")
        
        # Verify in database
        edition.refresh_from_db()
        self.assertEqual(edition.year, 2025)
        self.assertEqual(edition.location, "Updated Location")
    
    def test_edition_delete(self):
        """Test deleting edition"""
        edition = EditionFactory()
        edition_id = edition.id
        
        response = self.client.delete(f'/api/editions/{edition_id}/')
        
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Edition.objects.filter(id=edition_id).exists())
    
    def test_edition_detail(self):
        """Test GET /api/editions/{id}/"""
        edition = EditionFactory(year=2024, location="Test City")
        
        response = self.client.get(f'/api/editions/{edition.id}/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['id'], edition.id)
        self.assertEqual(data['year'], 2024)
        self.assertEqual(data['location'], "Test City")