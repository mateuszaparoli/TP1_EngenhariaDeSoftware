from django.db import models

class Event(models.Model):
	name = models.CharField(max_length=255)
	description = models.TextField(blank=True)

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
	pdf_url = models.CharField(max_length=500, blank=True, default='')
	pdf_file = models.FileField(upload_to='articles/', blank=True, null=True)  # Ensure this exists
	edition = models.ForeignKey(Edition, on_delete=models.CASCADE, related_name='articles', null=True, blank=True)
	authors = models.ManyToManyField(Author, related_name='articles', blank=True)
	bibtex = models.TextField(blank=True, default='')
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.title
