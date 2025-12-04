# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
    TokenBlacklistView,
)

from .views import RegisterView, UserDetailView, UserListView
from .auth_email import EmailTokenObtainPairView
from .views_password_reset import (
    PasswordResetRequestView,
    PasswordResetVerifyView,
    PasswordResetConfirmView,
)
from .views_email_verify import (
    EmailVerificationSendView,
    EmailVerificationVerifyView,
)
from .views import DeleteAccountView

app_name = "users"

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/login-email/", EmailTokenObtainPairView.as_view(), name="login_email"),
    path("auth/logout/", TokenBlacklistView.as_view(), name="logout"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # Password Reset
    path("auth/password-reset/", PasswordResetRequestView.as_view(), name="password_reset"),
    path("auth/password-reset/verify/", PasswordResetVerifyView.as_view(), name="password_reset_verify"),
    path("auth/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),

    # Email Verification
    path("auth/email-verify/send/", EmailVerificationSendView.as_view(), name="email_verify_send"),
    path("auth/email-verify/verify/", EmailVerificationVerifyView.as_view(), name="email_verify_verify"),

    path("me/", UserDetailView.as_view(), name="me"),
    path("delete-account/", DeleteAccountView.as_view(), name="delete_account"),  

    path("", UserListView.as_view(), name="user-list"),
]
