from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
import logging

from .models import Article, Subscription

# Configure logging
logger = logging.getLogger(__name__)

@receiver(post_save, sender=Article)
def notify_subscribers_on_article(sender, instance: Article, created, **kwargs):
    if not created:
        return
    
    logger.info(f"New article created: {instance.title}")
    
    # find subscriptions matching event or any author
    event = instance.edition.event if instance.edition else None
    # collect unique emails
    emails = set()
    
    # subscriptions to the event
    if event:
        event_subscriptions = Subscription.objects.filter(event=event)
        for s in event_subscriptions:
            emails.add(s.email)
            logger.info(f"Found event subscription: {s.email} for event {event.name}")
    
    # subscriptions to any of the authors
    for author in instance.authors.all():
        author_subscriptions = Subscription.objects.filter(author=author)
        for s in author_subscriptions:
            emails.add(s.email)
            logger.info(f"Found author subscription: {s.email} for author {author.name}")
    
    # general subscriptions (no author/event)
    general_subscriptions = Subscription.objects.filter(author__isnull=True, event__isnull=True)
    for s in general_subscriptions:
        emails.add(s.email)
        logger.info(f"Found general subscription: {s.email}")

    if not emails:
        logger.info("No subscribers found for this article")
        return

    logger.info(f"Found {len(emails)} unique subscribers: {list(emails)}")

    # Build email content
    authors_list = ", ".join([author.name for author in instance.authors.all()])
    event_info = f" in {event.name}" if event else ""
    edition_info = f" ({instance.edition.year})" if instance.edition else ""
    
    subject = f"Novo artigo publicado: {instance.title}"
    message = f"""
Olá!

Um novo artigo foi adicionado ao ResearchHub:

Título: {instance.title}
Autores: {authors_list}
Evento: {event.name if event else 'N/A'}{edition_info}

Resumo:
{instance.abstract or 'Não disponível'}

{f'Link: {instance.pdf_url}' if instance.pdf_url else ''}

---
Esta é uma notificação automática do ResearchHub.
Você está recebendo este email porque se cadastrou para receber notificações sobre novos artigos.
"""

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@researchhub.com')

    # send emails individually to avoid disclosing addresses
    success_count = 0
    for email_to in emails:
        try:
            send_mail(
                subject, 
                message, 
                from_email, 
                [email_to], 
                fail_silently=False
            )
            logger.info(f"Email sent successfully to {email_to}")
            success_count += 1
        except Exception as e:
            logger.error(f"Failed to send email to {email_to}: {str(e)}")
            # For development, also print to console
            print(f"[EMAIL NOTIFICATION] Para: {email_to}")
            print(f"[EMAIL NOTIFICATION] Assunto: {subject}")
            print(f"[EMAIL NOTIFICATION] Conteúdo:\n{message}")
            print("-" * 50)
    
    logger.info(f"Successfully sent {success_count} out of {len(emails)} notification emails")
