"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from library.views import (
    ArticleListCreateAPIView,
    ArticleDetailView,
    EditionListCreateView,
    EditionDetailView,
    EventListCreateView,
    EventDetailView,
    AuthorArticlesView,
    SubscriptionCreateView,
    SubscriptionListView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/articles/', ArticleListCreateAPIView.as_view(), name='article-list-create'),
    path('api/articles/<int:pk>/', ArticleDetailView.as_view(), name='article-detail'),
    path('api/editions/', EditionListCreateView.as_view(), name='edition-list-create'),
    path('api/editions/<int:pk>/', EditionDetailView.as_view(), name='edition-detail'),
    path('api/events/', EventListCreateView.as_view(), name='event-list-create'),
    path('api/events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('api/authors/<int:pk>/articles/', AuthorArticlesView.as_view(), name='author-articles'),
    path('api/subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    path('api/subscriptions/create/', SubscriptionCreateView.as_view(), name='subscription-create'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
