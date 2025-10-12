from rest_framework import serializers
from library.models import Article, Author, Edition, Event, Subscription

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'name', 'sigla', 'entidade_promotora']

class EditionSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    event_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Edition
        fields = ['id', 'event', 'event_id', 'year', 'location', 'start_date', 'end_date']

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'email']

class ArticleSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    edition = EditionSerializer(read_only=True)

    class Meta:
        model = Article
        fields = ['id', 'title', 'abstract', 'pdf_url', 'edition', 'authors', 'bibtex', 'created_at']

    def create(self, validated_data):
        authors_data = validated_data.pop('authors', [])
        article = Article.objects.create(**validated_data)
        for author_data in authors_data:
            author, _ = Author.objects.get_or_create(**author_data)
            article.authors.add(author)
        return article

    def update(self, instance, validated_data):
        authors_data = validated_data.pop('authors', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if authors_data is not None:
            instance.authors.clear()
            for author_data in authors_data:
                author, _ = Author.objects.get_or_create(**author_data)
                instance.authors.add(author)
        return instance

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['id', 'email', 'author', 'event', 'created_at']
