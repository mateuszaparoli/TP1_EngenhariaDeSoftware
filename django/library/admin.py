from django.contrib import admin
from .models import Event, Edition, Author, Article
from .models import Subscription

class EditionInline(admin.TabularInline):
    model = Edition
    extra = 0

class ArticleInline(admin.TabularInline):
    model = Article
    extra = 0
    filter_horizontal = ('authors',)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    inlines = [EditionInline]

@admin.register(Edition)
class EditionAdmin(admin.ModelAdmin):
    list_display = ('event', 'year', 'location', 'start_date', 'end_date')
    list_filter = ('year', 'event')
    search_fields = ('event__name', 'location')
    inlines = [ArticleInline]

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name', 'email')
    search_fields = ('name', 'email')

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'edition', 'created_at')
    search_fields = ('title', 'bibtex')
    filter_horizontal = ('authors',)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('email', 'author', 'event', 'created_at')
    search_fields = ('email',)
