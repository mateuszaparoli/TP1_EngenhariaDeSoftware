from rest_framework import serializers
from library.models import Article, Author, Edition

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'email']

class ArticleSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True)

    class Meta:
        model = Article
        fields = ['id', 'title', 'abstract', 'pdf_url', 'edition', 'authors', 'bibtex', 'created_at']

    def create(self, validated_data):
        authors_data = validated_data.pop('authors')
        article = Article.objects.create(**validated_data)
        for author_data in authors_data:
            author, _ = Author.objects.get_or_create(**author_data)
            article.authors.add(author)
        return article
