from django.shortcuts import render
# MelodyUnmixApp/users/views.py
from rest_framework import permissions, generics
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

