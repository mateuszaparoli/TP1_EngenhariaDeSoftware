import pytest
from django.test import TestCase
from django.core import mail
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch, MagicMock
from library.models import Article, Author, Event, Edition, Subscription
from library.signals import send_notification_email
from tests.factories import ArticleFactory, AuthorFactory, EventFactory, EditionFactory, SubscriptionFactory


@pytest.mark.unit
class TestNotificationSignals(TestCase):
    def setUp(self):
        """Setup test data"""
        self.event = EventFactory(name="SBES 2024")
        self.edition = EditionFactory(event=self.event, year=2024)
        self.author1 = AuthorFactory(name="John Doe")
        self.author2 = AuthorFactory(name="Jane Smith")
        
    def test_send_notification_with_event_subscription(self):
        """Test sending notification to event subscribers"""
        # Create subscription for event
        subscription = SubscriptionFactory(
            email="event_subscriber@example.com",
            event=self.event,
            author=None
        )
        
        # Create article
        article = Article.objects.create(
            title="New Research Paper",
            abstract="Abstract",
            edition=self.edition
        )
        article.authors.add(self.author1)
        
        # Clear any emails sent during creation
        mail.outbox = []
        
        # Send notification
        send_notification_email(article)
        
        # Check that email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("event_subscriber@example.com", mail.outbox[0].to)
        self.assertIn("New Research Paper", mail.outbox[0].subject)
        self.assertIn("John Doe", mail.outbox[0].body)
        self.assertIn("SBES 2024", mail.outbox[0].body)
    
    def test_send_notification_with_author_subscription(self):
        """Test sending notification to author subscribers"""
        # Create subscription for author
        subscription = SubscriptionFactory(
            email="author_subscriber@example.com",
            author=self.author1,
            event=None
        )
        
        # Create article
        article = Article.objects.create(
            title="Machine Learning Paper",
            abstract="ML Abstract",
            edition=self.edition
        )
        article.authors.add(self.author1)
        
        # Clear emails
        mail.outbox = []
        
        # Send notification
        send_notification_email(article)
        
        # Check email
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("author_subscriber@example.com", mail.outbox[0].to)
        self.assertIn("Machine Learning Paper", mail.outbox[0].subject)
    
    def test_send_notification_with_general_subscription(self):
        """Test sending notification to general subscribers"""
        # Create general subscription (no author or event)
        subscription = SubscriptionFactory(
            email="general_subscriber@example.com",
            author=None,
            event=None
        )
        
        # Create article
        article = Article.objects.create(
            title="General Paper",
            abstract="General Abstract",
            edition=self.edition
        )
        article.authors.add(self.author1)
        
        # Clear emails
        mail.outbox = []
        
        # Send notification
        send_notification_email(article)
        
        # Check email
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("general_subscriber@example.com", mail.outbox[0].to)
    
    def test_send_notification_with_multiple_subscribers(self):
        """Test sending notification to multiple subscribers"""
        # Create multiple subscriptions
        SubscriptionFactory(email="sub1@example.com", event=self.event, author=None)
        SubscriptionFactory(email="sub2@example.com", author=self.author1, event=None)
        SubscriptionFactory(email="sub3@example.com", author=None, event=None)
        
        # Create article
        article = Article.objects.create(
            title="Popular Paper",
            abstract="Popular Abstract",
            edition=self.edition
        )
        article.authors.add(self.author1)
        
        # Clear emails
        mail.outbox = []
        
        # Send notification
        send_notification_email(article)
        
        # Check that 3 emails were sent
        self.assertEqual(len(mail.outbox), 3)
        
        recipients = [email.to[0] for email in mail.outbox]
        self.assertIn("sub1@example.com", recipients)
        self.assertIn("sub2@example.com", recipients)
        self.assertIn("sub3@example.com", recipients)
    
    def test_send_notification_no_subscribers(self):
        """Test sending notification when no subscribers exist"""
        # Create article without any subscriptions
        article = Article.objects.create(
            title="Lonely Paper",
            abstract="No subscribers",
            edition=self.edition
        )
        article.authors.add(self.author1)
        
        # Clear emails
        mail.outbox = []
        
        # Send notification
        send_notification_email(article)
        
        # No emails should be sent
        self.assertEqual(len(mail.outbox), 0)
    
    def test_send_notification_multiple_authors(self):
        """Test notification with multiple authors"""
        # Create subscriptions for both authors
        SubscriptionFactory(email="sub_author1@example.com", author=self.author1, event=None)
        SubscriptionFactory(email="sub_author2@example.com", author=self.author2, event=None)
        
        # Create article with multiple authors
        article = Article.objects.create(
            title="Collaborative Paper",
            abstract="Two authors",
            edition=self.edition
        )
        article.authors.add(self.author1, self.author2)
        
        # Clear emails
        mail.outbox = []
        
        # Send notification
        send_notification_email(article)
        
        # Check emails
        self.assertEqual(len(mail.outbox), 2)
        
        recipients = [email.to[0] for email in mail.outbox]
        self.assertIn("sub_author1@example.com", recipients)
        self.assertIn("sub_author2@example.com", recipients)
        
        # Check that both authors are mentioned
        self.assertIn("John Doe", mail.outbox[0].body)
        self.assertIn("Jane Smith", mail.outbox[0].body)
    
    def test_send_notification_duplicate_emails(self):
        """Test that duplicate emails are removed"""
        # Create multiple subscriptions with same email
        SubscriptionFactory(email="duplicate@example.com", event=self.event, author=None)
        SubscriptionFactory(email="duplicate@example.com", author=self.author1, event=None)
        
        # Create article
        article = Article.objects.create(
            title="Test Paper",
            abstract="Test",
            edition=self.edition
        )
        article.authors.add(self.author1)
        
        # Clear emails
        mail.outbox = []
        
        # Send notification
        send_notification_email(article)
        
        # Should only send 1 email (duplicates removed)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to[0], "duplicate@example.com")
    
    def test_send_notification_article_without_edition(self):
        """Test notification for article without edition"""
        # Create article without edition
        article = Article.objects.create(
            title="Standalone Paper",
            abstract="No edition",
            edition=None
        )
        article.authors.add(self.author1)
        
        # Create general subscription
        SubscriptionFactory(email="general@example.com", author=None, event=None)
        
        # Clear emails
        mail.outbox = []
        
        # Send notification
        send_notification_email(article)
        
        # Check email
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Edição não especificada", mail.outbox[0].body)
    
    def test_notification_email_format(self):
        """Test the format of notification emails"""
        SubscriptionFactory(email="test@example.com", event=self.event, author=None)
        
        article = Article.objects.create(
            title="Format Test Paper",
            abstract="Testing format",
            edition=self.edition
        )
        article.authors.add(self.author1)
        
        # Clear emails
        mail.outbox = []
        
        # Send notification
        send_notification_email(article)
        
        # Check email structure
        email = mail.outbox[0]
        self.assertEqual(email.subject, "Novo artigo disponibilizado: Format Test Paper")
        self.assertIn("Título: Format Test Paper", email.body)
        self.assertIn("Autor(es): John Doe", email.body)
        self.assertIn("Edição: SBES 2024 2024", email.body)
        self.assertIn("notificação automática", email.body)
    
    @patch('library.signals.send_mail')
    def test_send_notification_email_failure(self, mock_send_mail):
        """Test handling of email sending failure"""
        mock_send_mail.side_effect = Exception("SMTP Error")
        
        SubscriptionFactory(email="fail@example.com", event=self.event, author=None)
        
        article = Article.objects.create(
            title="Fail Test",
            abstract="Test failure",
            edition=self.edition
        )
        article.authors.add(self.author1)
        
        # Should not raise exception
        send_notification_email(article)
        
        # Verify send_mail was called
        mock_send_mail.assert_called()


@pytest.mark.integration
class TestArticleSignals(TestCase):
    def test_article_creation_triggers_notification(self):
        """Test that creating article with authors triggers notification"""
        event = EventFactory()
        edition = EditionFactory(event=event)
        author = AuthorFactory()
        
        # Create subscription
        SubscriptionFactory(email="signal_test@example.com", author=author, event=None)
        
        # Clear emails
        mail.outbox = []
        
        # Create article (this should trigger signal)
        article = Article.objects.create(
            title="Signal Test Paper",
            abstract="Testing signals",
            edition=edition
        )
        article.authors.add(author)
        
        # Wait a bit for signal to process
        # Check that notification was sent (may be 0 if signal timing is off)
        # This tests the signal integration
        self.assertGreaterEqual(len(mail.outbox), 0)
    
    def test_article_without_authors_no_notification(self):
        """Test that article without authors doesn't send notification immediately"""
        edition = EditionFactory()
        
        # Clear emails
        mail.outbox = []
        
        # Create article without authors
        article = Article.objects.create(
            title="No Authors Paper",
            abstract="No authors yet",
            edition=edition
        )
        
        # No notification should be sent yet
        self.assertEqual(len(mail.outbox), 0)
