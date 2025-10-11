from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from .models import Article, Subscription


@receiver(post_save, sender=Article)
def notify_subscribers_on_article(sender, instance: Article, created, **kwargs):
    if not created:
        return
    # find subscriptions matching event or any author
    event = instance.edition.event if instance.edition else None
    # collect unique emails
    emails = set()
    # subscriptions to the event
    if event:
        for s in Subscription.objects.filter(event=event):
            emails.add(s.email)
    # subscriptions to any of the authors
    for author in instance.authors.all():
        for s in Subscription.objects.filter(author=author):
            emails.add(s.email)
    # general subscriptions (no author/event)
    for s in Subscription.objects.filter(author__isnull=True, event__isnull=True):
        emails.add(s.email)

    if not emails:
        return

    subject = f"New article published: {instance.title}"
    message = f"A new article '{instance.title}' was added.\n\nAbstract:\n{instance.abstract or 'N/A'}\n\nLink: {instance.pdf_url or 'N/A'}"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com')

    # send emails individually to avoid disclosing addresses
    for to in emails:
        try:
            send_mail(subject, message, from_email, [to], fail_silently=False)
        except Exception:
            # in case email not configured, fallback to printing to stdout
            print(f"[notify] would send email to {to}: {subject}")
