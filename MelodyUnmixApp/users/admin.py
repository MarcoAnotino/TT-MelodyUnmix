from django.contrib import admin
from .models import Usuario, EmailVerificationCode, PasswordResetCode

# admin.site.register(Usuario)

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'rol', 'is_active', 'is_staff', 'fecha_registro')
    list_filter = ('rol', 'is_active', 'is_staff')
    search_fields = ('username', 'email')


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'created_at', 'used_at', 'attempts')
    list_filter = ('created_at', 'used_at')
    search_fields = ('email', 'code')
    readonly_fields = ('created_at', 'used_at')


@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'created_at', 'used_at', 'attempts')
    list_filter = ('created_at', 'used_at')
    search_fields = ('email', 'code')
    readonly_fields = ('created_at', 'used_at')