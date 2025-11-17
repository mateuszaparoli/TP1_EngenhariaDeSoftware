import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from library.models import Event, Edition, Article, Author, Subscription
from tests.factories import EventFactory, EditionFactory, ArticleFactory, AuthorFactory, SubscriptionFactory
from datetime import date, timedelta

@pytest.mark.unit
class TestEventModel(TestCase):
    def test_event_creation(self):
        """Test basic event creation"""
        event = EventFactory(
            name="Brazilian Symposium on Software Engineering",
            sigla="SBES",
            entidade_promotora="SBC"
        )
        self.assertEqual(event.name, "Brazilian Symposium on Software Engineering")
        self.assertEqual(event.sigla, "SBES")
        self.assertEqual(event.entidade_promotora, "SBC")
        
    def test_event_str_representation(self):
        """Test string representation of event"""
        event = EventFactory(name="SBES 2024")
        self.assertEqual(str(event), "SBES 2024")
        
    def test_event_default_values(self):
        """Test default values for optional fields"""
        event = Event.objects.create(name="Test Event")
        self.assertEqual(event.sigla, "")
        self.assertEqual(event.entidade_promotora, "")

@pytest.mark.unit
class TestEditionModel(TestCase):
    def test_edition_creation(self):
        """Test basic edition creation"""
        event = EventFactory()
        edition = EditionFactory(
            event=event,
            year=2024,
            location="Belo Horizonte",
            start_date=date(2024, 10, 21),
            end_date=date(2024, 10, 25)
        )
        self.assertEqual(edition.event, event)
        self.assertEqual(edition.year, 2024)
        self.assertEqual(edition.location, "Belo Horizonte")
        
    def test_edition_str_representation(self):
        """Test string representation of edition"""
        event = EventFactory(name="SBES")
        edition = EditionFactory(event=event, year=2024)
        self.assertEqual(str(edition), "SBES 2024")
        
    def test_edition_cascade_delete(self):
        """Test that deleting event deletes its editions"""
        event = EventFactory()
        edition = EditionFactory(event=event)
        event_id = event.id
        edition_id = edition.id
        
        event.delete()
        
        self.assertFalse(Event.objects.filter(id=event_id).exists())
        self.assertFalse(Edition.objects.filter(id=edition_id).exists())

@pytest.mark.unit
class TestAuthorModel(TestCase):
    def test_author_creation(self):
        """Test basic author creation"""
        author = AuthorFactory(
            name="John Doe",
            email="john@example.com"
        )
        self.assertEqual(author.name, "John Doe")
        self.assertEqual(author.email, "john@example.com")
        
    def test_author_str_representation(self):
        """Test string representation of author"""
        author = AuthorFactory(name="Jane Smith")
        self.assertEqual(str(author), "Jane Smith")
        
    def test_author_without_email(self):
        """Test author creation without email"""
        author = Author.objects.create(name="Anonymous Author")
        self.assertEqual(author.email, "")

@pytest.mark.unit
class TestArticleModel(TestCase):
    def test_article_creation(self):
        """Test basic article creation"""
        edition = EditionFactory()
        authors = [AuthorFactory(), AuthorFactory()]
        
        article = ArticleFactory(
            title="Test Article",
            abstract="This is a test abstract",
            edition=edition,
            authors=authors
        )
        
        self.assertEqual(article.title, "Test Article")
        self.assertEqual(article.abstract, "This is a test abstract")
        self.assertEqual(article.edition, edition)
        self.assertEqual(list(article.authors.all()), authors)
        
    def test_article_str_representation(self):
        """Test string representation of article"""
        article = ArticleFactory(title="My Research Paper")
        self.assertEqual(str(article), "My Research Paper")
        
    def test_article_without_edition(self):
        """Test article creation without edition"""
        article = Article.objects.create(title="Standalone Article")
        self.assertIsNone(article.edition)
        
    def test_article_multiple_authors(self):
        """Test article with multiple authors"""
        authors = [AuthorFactory() for _ in range(3)]
        article = ArticleFactory(authors=authors)
        
        self.assertEqual(article.authors.count(), 3)
        for author in authors:
            self.assertIn(author, article.authors.all())
            
    def test_article_page_numbers(self):
        """Test article page number fields"""
        article = ArticleFactory(
            pagina_inicial=10,
            pagina_final=25
        )
        self.assertEqual(article.pagina_inicial, 10)
        self.assertEqual(article.pagina_final, 25)
        
    def test_article_cascade_delete_edition(self):
        """Test that deleting edition deletes its articles"""
        edition = EditionFactory()
        article = ArticleFactory(edition=edition)
        edition_id = edition.id
        article_id = article.id
        
        edition.delete()
        
        self.assertFalse(Edition.objects.filter(id=edition_id).exists())
        self.assertFalse(Article.objects.filter(id=article_id).exists())

@pytest.mark.unit
class TestSubscriptionModel(TestCase):
    def test_subscription_creation(self):
        """Test basic subscription creation"""
        author = AuthorFactory()
        event = EventFactory()
        
        subscription = SubscriptionFactory(
            email="user@example.com",
            author=author,
            event=event
        )
        
        self.assertEqual(subscription.email, "user@example.com")
        self.assertEqual(subscription.author, author)
        self.assertEqual(subscription.event, event)
        
    def test_subscription_str_representation(self):
        """Test string representation of subscription"""
        author = AuthorFactory(name="John Doe")
        event = EventFactory(name="SBES")
        subscription = SubscriptionFactory(
            email="test@example.com",
            author=author,
            event=event
        )
        
        expected = "test@example.com | author=John Doe | event=SBES"
        self.assertEqual(str(subscription), expected)
        
    def test_subscription_author_only(self):
        """Test subscription with author only"""
        author = AuthorFactory(name="Jane Smith")
        subscription = SubscriptionFactory(
            email="user@example.com",
            author=author,
            event=None
        )
        
        expected = "user@example.com | author=Jane Smith"
        self.assertEqual(str(subscription), expected)
        
    def test_subscription_event_only(self):
        """Test subscription with event only"""
        event = EventFactory(name="ICSE")
        subscription = SubscriptionFactory(
            email="user@example.com",
            author=None,
            event=event
        )
        
        expected = "user@example.com | event=ICSE"
        self.assertEqual(str(subscription), expected)
        
    def test_subscription_general(self):
        """Test general subscription (no author or event)"""
        subscription = Subscription.objects.create(
            email="user@example.com"
        )
        
        expected = "user@example.com"
        self.assertEqual(str(subscription), expected)
        
    def test_subscription_cascade_delete_author(self):
        """Test that deleting author deletes related subscriptions"""
        author = AuthorFactory()
        subscription = SubscriptionFactory(author=author)
        author_id = author.id
        subscription_id = subscription.id
        
        author.delete()
        
        self.assertFalse(Author.objects.filter(id=author_id).exists())
        self.assertFalse(Subscription.objects.filter(id=subscription_id).exists())
        
    def test_subscription_cascade_delete_event(self):
        """Test that deleting event deletes related subscriptions"""
        event = EventFactory()
        subscription = SubscriptionFactory(event=event, author=None)
        event_id = event.id
        subscription_id = subscription.id
        
        event.delete()
        
        self.assertFalse(Event.objects.filter(id=event_id).exists())
        self.assertFalse(Subscription.objects.filter(id=subscription_id).exists())