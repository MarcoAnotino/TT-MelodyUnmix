from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.timezone import now
from django.conf import settings

def send_templated_email(subject, to_email, template_base, context):
    """
    template_base: p.ej. 'emails/account_welcome' (sin .html/.txt)
    context: dict con variables para la plantilla (se añade 'subject' y 'now')
    """
    ctx = {**context, "subject": subject, "now": now()}
    html_body = render_to_string(f"{template_base}.html", ctx)
    text_body = render_to_string(f"{template_base}.txt", ctx)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None) or settings.EMAIL_HOST_USER,
        to=[to_email],
    )
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=False)
