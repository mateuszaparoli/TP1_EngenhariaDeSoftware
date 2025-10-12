from django.urls import path
from . import views

urlpatterns = [
    # Events
    path('events/', views.EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),

    # Editions
    path('editions/', views.EditionListCreateView.as_view(), name='edition-list-create'),
    path('editions/<int:pk>/', views.EditionDetailView.as_view(), name='edition-detail'),

    # Articles
    path('articles/', views.ArticleListCreateAPIView.as_view(), name='article-list-create'),
    path('articles/<int:pk>/', views.ArticleDetailView.as_view(), name='article-detail'),
    path('articles/bulk-import/', views.BulkImportArticlesView.as_view(), name='bulk-import-articles'),

    # Authors (articles by author)
    path('authors/<int:pk>/articles/', views.AuthorArticlesView.as_view(), name='author-articles'),
    path('authors/<str:author_name>/', views.AuthorByNameView.as_view(), name='author-by-name'),

    # Subscriptions
    path('subscriptions/', views.SubscriptionListView.as_view(), name='subscription-list'),
    path('subscriptions/create/', views.SubscriptionCreateView.as_view(), name='subscription-create'),
]
