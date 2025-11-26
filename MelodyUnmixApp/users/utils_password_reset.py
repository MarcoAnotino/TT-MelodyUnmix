# users/utils_password_reset.py
import secrets
import string
from django.conf import settings

from .email_utils import send_templated_email


def generate_human_code(blocks=6, block_len=1):
    """
    Genera un código en formato X-X-X-X-X-X (o por bloques)
    garantizando que haya al menos 1 letra y 1 número en todo el código.
    """
    alphabet = string.ascii_uppercase + string.digits
    total_len = blocks * block_len

    while True:
        raw = "".join(secrets.choice(alphabet) for _ in range(total_len))
        # Validar que tenga al menos una letra y un dígito
        if any(c.isalpha() for c in raw) and any(c.isdigit() for c in raw):
            break

    # Partir en bloques
    parts = [raw[i:i + block_len] for i in range(0, total_len, block_len)]
    return "-".join(parts)


def send_reset_email(to_email: str, code: str):
    """
    Envía el correo de reseteo usando plantillas HTML/TXT
    con el diseño de Melody Unmix.
    """
    subject = "Recupera tu contraseña · Melody Unmix"
    ttl = getattr(settings, "PASSWORD_RESET_CODE_TTL_MIN", 15)

    context = {
        "code": code,
        "ttl_minutes": ttl,
        # 'subject' y 'now' se añaden dentro de send_templated_email
    }

    # templates:
    # - templates/emails/password_reset_code.html
    # - templates/emails/password_reset_code.txt
    send_templated_email(
        subject=subject,
        to_email=to_email,
        template_base="emails/password_reset_code",
        context=context,
    )
