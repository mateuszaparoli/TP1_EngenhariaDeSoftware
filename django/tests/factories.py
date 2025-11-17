import factory
from factory.django import DjangoModelFactory
from faker import Faker
from django.core.files.base import ContentFile
from library.models import Event, Edition, Article, Author, Subscription
import datetime

fake = Faker()

class EventFactory(DjangoModelFactory):
    class Meta:
        model = Event
    
    name = factory.Sequence(lambda n: f"Conference {n}")
    sigla = factory.LazyAttribute(lambda obj: f"CONF{obj.name[-1:]}")
    entidade_promotora = factory.Faker('company')

class EditionFactory(DjangoModelFactory):
    class Meta:
        model = Edition
    
    event = factory.SubFactory(EventFactory)
    year = factory.Faker('random_int', min=2020, max=2025)
    location = factory.Faker('city')
    start_date = factory.LazyFunction(lambda: fake.date_between(start_date='-2y', end_date='today'))
    end_date = factory.LazyAttribute(lambda obj: obj.start_date + datetime.timedelta(days=3))

class AuthorFactory(DjangoModelFactory):
    class Meta:
        model = Author
    
    name = factory.Faker('name')
    email = factory.Faker('email')

class ArticleFactory(DjangoModelFactory):
    class Meta:
        model = Article
        skip_postgeneration_save = True
    
    title = factory.Faker('sentence', nb_words=6)
    abstract = factory.Faker('paragraph', nb_sentences=5)
    pdf_url = factory.Faker('url')
    edition = factory.SubFactory(EditionFactory)
    bibtex = factory.LazyAttribute(lambda obj: f'@inproceedings{{key, title={{{obj.title}}}, year={{{obj.edition.year}}}}}')
    pagina_inicial = factory.Faker('random_int', min=1, max=100)
    pagina_final = factory.LazyAttribute(lambda obj: obj.pagina_inicial + fake.random_int(min=5, max=20))
    
    @factory.post_generation
    def authors(self, create, extracted, **kwargs):
        if not create:
            return
        
        if extracted:
            for author in extracted:
                self.authors.add(author)
        else:
            # Add 1-3 random authors
            num_authors = fake.random_int(min=1, max=3)
            for _ in range(num_authors):
                author = AuthorFactory()
                self.authors.add(author)

class SubscriptionFactory(DjangoModelFactory):
    class Meta:
        model = Subscription
    
    email = factory.Faker('email')
    author = factory.SubFactory(AuthorFactory)
    event = factory.SubFactory(EventFactory)