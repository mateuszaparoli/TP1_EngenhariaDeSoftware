from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
import logging

from .models import Article, Subscription

# Configure logging
logger = logging.getLogger(__name__)

def send_notification_email(article_instance):
    """Função auxiliar para enviar emails de notificação"""
    print(f"[DEBUG] Enviando notificação para artigo: {article_instance.title}")
    
    # find subscriptions matching event or any author
    event = article_instance.edition.event if article_instance.edition else None
    # collect unique emails
    emails = set()
    
    print(f"[DEBUG] Evento do artigo: {event}")
    print(f"[DEBUG] Autores do artigo: {[a.name for a in article_instance.authors.all()]}")
    
    # subscriptions to the event
    if event:
        event_subscriptions = Subscription.objects.filter(event=event)
        print(f"[DEBUG] Subscriptions para o evento {event.name}: {event_subscriptions.count()}")
        for s in event_subscriptions:
            emails.add(s.email)
            logger.info(f"Found event subscription: {s.email} for event {event.name}")
            print(f"[DEBUG] Adicionado email por evento: {s.email}")
    
    # subscriptions to any of the authors
    for author in article_instance.authors.all():
        print(f"[DEBUG] Verificando subscriptions para autor: {author.name}")
        author_subscriptions = Subscription.objects.filter(author=author)
        print(f"[DEBUG] Subscriptions encontradas para {author.name}: {author_subscriptions.count()}")
        for s in author_subscriptions:
            emails.add(s.email)
            logger.info(f"Found author subscription: {s.email} for author {author.name}")
            print(f"[DEBUG] Adicionado email por autor: {s.email}")
    
    # general subscriptions (no author/event)
    general_subscriptions = Subscription.objects.filter(author__isnull=True, event__isnull=True)
    print(f"[DEBUG] Subscriptions gerais: {general_subscriptions.count()}")
    for s in general_subscriptions:
        emails.add(s.email)
        logger.info(f"Found general subscription: {s.email}")
        print(f"[DEBUG] Adicionado email geral: {s.email}")

    print(f"[DEBUG] Total de emails únicos encontrados: {len(emails)}")
    print(f"[DEBUG] Lista de emails: {list(emails)}")

    if not emails:
        logger.info("No subscribers found for this article")
        print("[DEBUG] Nenhum subscriber encontrado para este artigo")
        return

    logger.info(f"Found {len(emails)} unique subscribers: {list(emails)}")

    # Build email content formatado conforme solicitado
    authors_list = ", ".join([author.name for author in article_instance.authors.all()])
    
    # Formatação da edição conforme solicitado
    edition_info = ""
    if article_instance.edition:
        if event:
            edition_info = f"{event.name} {article_instance.edition.year}"
        else:
            edition_info = f"Edição {article_instance.edition.year}"
    else:
        edition_info = "Edição não especificada"
    
    subject = f"Novo artigo disponibilizado: {article_instance.title}"
    
    # Mensagem formatada conforme especificação (título, autor e edição)
    message = f"""Olá!

Um novo artigo foi disponibilizado no sistema:

Título: {article_instance.title}

Autor(es): {authors_list if authors_list else 'Não especificado'}

Edição: {edition_info}

---
Esta é uma notificação automática.
Você está recebendo este email porque se cadastrou para receber notificações sobre novos artigos.
"""

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@researchhub.com')
    print(f"[DEBUG] From email: {from_email}")
    print(f"[DEBUG] Subject: {subject}")
    print(f"[DEBUG] Message preview: {message[:100]}...")

    # send emails individually to avoid disclosing addresses
    success_count = 0
    for email_to in emails:
        print(f"[DEBUG] Tentando enviar email para: {email_to}")
        try:
            send_mail(
                subject, 
                message, 
                from_email, 
                [email_to], 
                fail_silently=False
            )
            logger.info(f"Email sent successfully to {email_to}")
            print(f"[DEBUG] Email enviado com sucesso para: {email_to}")
            success_count += 1
        except Exception as e:
            logger.error(f"Failed to send email to {email_to}: {str(e)}")
            print(f"[DEBUG] ERRO ao enviar email para {email_to}: {str(e)}")
            # For development, also print to console
            print(f"[EMAIL NOTIFICATION] Para: {email_to}")
            print(f"[EMAIL NOTIFICATION] Assunto: {subject}")
            print(f"[EMAIL NOTIFICATION] Conteúdo:\n{message}")
            print("-" * 50)
    
    logger.info(f"Successfully sent {success_count} out of {len(emails)} notification emails")
    print(f"[DEBUG] Enviados {success_count} de {len(emails)} emails com sucesso")

@receiver(post_save, sender=Article)
def notify_subscribers_on_article_create(sender, instance: Article, created, **kwargs):
    """Signal para quando um artigo é criado - mas só verifica se tem autores"""
    print(f"[DEBUG] Signal post_save chamado para artigo: {instance.title}, created: {created}")
    
    if not created:
        print("[DEBUG] Artigo não é novo, não enviando notificação")
        return
    
    # Se o artigo já tem autores, enviar notificação imediatamente
    if instance.authors.exists():
        print("[DEBUG] Artigo criado com autores, enviando notificação")
        send_notification_email(instance)
    else:
        print("[DEBUG] Artigo criado sem autores, aguardando adição de autores")

@receiver(m2m_changed, sender=Article.authors.through)
def notify_subscribers_on_authors_added(sender, instance, action, pk_set, **kwargs):
    """Signal para quando autores são adicionados ao artigo"""
    print(f"[DEBUG] Signal m2m_changed chamado para artigo: {instance.title}, action: {action}")
    
    if action == "post_add" and pk_set:
        print(f"[DEBUG] Autores adicionados ao artigo: {list(pk_set)}")
        print(f"[DEBUG] Verificando se artigo foi criado recentemente...")
        
        # Verificar se o artigo foi criado recentemente (últimos 5 minutos)
        from django.utils import timezone
        from datetime import timedelta
        
        if instance.created_at and (timezone.now() - instance.created_at) < timedelta(minutes=5):
            print("[DEBUG] Artigo é recente, enviando notificação")
            send_notification_email(instance)
        else:
            print("[DEBUG] Artigo não é recente, não enviando notificação")
