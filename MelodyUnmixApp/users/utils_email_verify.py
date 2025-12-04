# MelodyUnmixApp/users/utils_email_verify.py
import secrets
import string
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from .models import EmailVerificationCode
from .email_utils import send_templated_email


def generate_verification_code():
    """
    Genera un código alfanumérico de 6 caracteres en el formato X-Y-Z-A-B-C
    Usa mayúsculas y números, sin caracteres ambiguos (0, O, 1, I, l)
    """
    charset = string.ascii_uppercase.replace("O", "").replace("I", "") + string.digits.replace("0", "").replace("1", "")
    # Genera 6 caracteres aleatorios
    chars = "".join(secrets.choice(charset) for _ in range(6))
    # Formato con guiones: X-Y-Z-A-B-C
    return "-".join(chars)


def create_verification_code(email):
    """
    Crea un código de verificación para el email dado.
    Invalida códigos anteriores no usados para el mismo email.
    Retorna el objeto EmailVerificationCode creado.
    """
    # Invalidar códigos previos no usados para este email (limpieza)
    EmailVerificationCode.objects.filter(
        email=email,
        used_at__isnull=True
    ).update(used_at=timezone.now())

    # Generar nuevo código
    code = generate_verification_code()
    verification_code = EmailVerificationCode.objects.create(
        email=email,
        code=code
    )
    return verification_code


def send_verification_email(email, first_name=None):
    """
    Envía un email con el código de verificación.
    Retorna el código generado si tiene éxito, None si falla.
    """
    try:
        # Crear código de verificación
        verification_code = create_verification_code(email)

        # Enviar email
        send_templated_email(
            subject="Verifica tu cuenta en Melody Unmix",
            to_email=email,
            template_base="emails/email_verification",
            context={
                "first_name": first_name or "usuario",
                "code": verification_code.code,
                "expiry_minutes": 30,  # El código expira en 30 minutos
            },
        )
        return verification_code.code
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception(f"Error al enviar código de verificación: {e}")
        return None


def verify_code(email, code, max_age_minutes=30, max_attempts=5):
    """
    Verifica un código de verificación.
    Retorna (success: bool, message: str)
    
    Args:
        email: Email del usuario
        code: Código a verificar
        max_age_minutes: Edad máxima del código en minutos (default 30)
        max_attempts: Número máximo de intentos permitidos (default 5)
    """
    try:
        # Buscar el código más reciente para este email que no ha sido usado
        verification = EmailVerificationCode.objects.filter(
            email=email,
            code=code,
            used_at__isnull=True
        ).order_by('-created_at').first()

        if not verification:
            return False, "Código inválido o ya usado."

        # Verificar expiración
        age_minutes = verification.age_seconds() / 60
        if age_minutes > max_age_minutes:
            return False, f"El código ha expirado. Los códigos son válidos por {max_age_minutes} minutos."

        # Verificar intentos
        verification.attempts += 1
        verification.save(update_fields=['attempts'])

        if verification.attempts > max_attempts:
            return False, f"Has excedido el número máximo de intentos ({max_attempts})."

        # Código válido - marcar como usado
        verification.mark_used()
        return True, "Email verificado correctamente."

    except Exception as e:
        import logging
        logging.getLogger(__name__).exception(f"Error al verificar código: {e}")
        return False, "Error al verificar el código. Inténtalo de nuevo."


def cleanup_old_codes(days=7):
    """
    Elimina códigos de verificación antiguos (por defecto, más de 7 días).
    Debe ejecutarse periódicamente (ej. con celery beat o cron).
    """
    cutoff = timezone.now() - timedelta(days=days)
    deleted_count, _ = EmailVerificationCode.objects.filter(
        created_at__lt=cutoff
    ).delete()
    return deleted_count
