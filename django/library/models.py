from django.db import models

class Event(models.Model):
	name = models.CharField(max_length=255)
	sigla = models.CharField(max_length=50, blank=True, default='')  # Acronym
	entidade_promotora = models.CharField(max_length=500, blank=True, default='')  # Promoting entity

	def __str__(self):
		return self.name

class Edition(models.Model):
	event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='editions')
	year = models.PositiveIntegerField()
	location = models.CharField(max_length=255, blank=True)
	start_date = models.DateField(null=True, blank=True)
	end_date = models.DateField(null=True, blank=True)

	def __str__(self):
		return f"{self.event.name} {self.year}"

class Author(models.Model):
	name = models.CharField(max_length=255)
	email = models.EmailField(blank=True)

	def __str__(self):
		return self.name

class Article(models.Model):
	title = models.CharField(max_length=500)
	abstract = models.TextField(blank=True, default='')
	pdf_url = models.URLField(blank=True, default='')
	pdf_file = models.FileField(upload_to='pdfs/', blank=True, null=True)
	edition = models.ForeignKey(Edition, on_delete=models.CASCADE, related_name='articles', null=True, blank=True)
	authors = models.ManyToManyField(Author, related_name='articles', blank=True)
	bibtex = models.TextField(blank=True, default='')
	pagina_inicial = models.IntegerField(null=True, blank=True)  # Start page
	pagina_final = models.IntegerField(null=True, blank=True)  # End page
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.title


class Subscription(models.Model):
	"""A lightweight subscription model so users can subscribe to authors or events by email.

	If both `author` and `event` are null, it's a general subscription for any new article.
	"""
	email = models.EmailField()
	author = models.ForeignKey(Author, null=True, blank=True, on_delete=models.CASCADE, related_name='subscriptions')
	event = models.ForeignKey(Event, null=True, blank=True, on_delete=models.CASCADE, related_name='subscriptions')
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		parts = [self.email]
		if self.author:
			parts.append(f"author={self.author.name}")
		if self.event:
			parts.append(f"event={self.event.name}")
		return " | ".join(parts)
