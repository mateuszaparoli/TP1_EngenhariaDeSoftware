from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json
from datetime import date

from .models import Edition, Event, Article, Author, Subscription

def _parse_date(s):
    if not s:
        return None
    try:
        return date.fromisoformat(s)
    except Exception:
        return None

def _edition_to_dict(ed: Edition):
    return {
        "id": ed.id,
        "event": {"id": ed.event.id, "name": ed.event.name},
        "year": ed.year,
        "location": ed.location or None,
        "start_date": ed.start_date.isoformat() if ed.start_date else None,
        "end_date": ed.end_date.isoformat() if ed.end_date else None,
    }

def _author_to_dict(a: Author):
    return {"id": a.id, "name": a.name, "email": a.email or None}

def _article_to_dict(a: Article):
    return {
        "id": a.id,
        "title": a.title,
        "abstract": a.abstract or None,
        "pdf_url": a.pdf_url or None,
        "edition": _edition_to_dict(a.edition) if a.edition_id else None,
        "authors": [_author_to_dict(x) for x in a.authors.all()],
        "bibtex": a.bibtex or None,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }

@method_decorator(csrf_exempt, name='dispatch')
class EditionListCreateView(View):
    def get(self, request):
        qs = Edition.objects.select_related("event").all()
        data = [_edition_to_dict(e) for e in qs]
        return JsonResponse(data, safe=False)

    def post(self, request):
        try:
            payload = json.loads(request.body.decode() or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid json"}, status=400)

        event_id = payload.get("event_id")
        event_name = payload.get("event_name")
        if event_id:
            event = get_object_or_404(Event, pk=event_id)
        elif event_name:
            event, _ = Event.objects.get_or_create(name=event_name)
        else:
            return JsonResponse({"error": "event_id or event_name required"}, status=400)

        year = payload.get("year")
        if year is None:
            return JsonResponse({"error": "year is required"}, status=400)

        start_date = _parse_date(payload.get("start_date"))
        end_date = _parse_date(payload.get("end_date"))

        edition = Edition.objects.create(
            event=event,
            year=int(year),
            location=payload.get("location", ""),
            start_date=start_date,
            end_date=end_date,
        )
        return JsonResponse(_edition_to_dict(edition), status=201)

@method_decorator(csrf_exempt, name='dispatch')
class EditionDetailView(View):
    def get(self, request, pk):
        ed = get_object_or_404(Edition.objects.select_related("event"), pk=pk)
        return JsonResponse(_edition_to_dict(ed))

    def put(self, request, pk):
        try:
            payload = json.loads(request.body.decode() or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid json"}, status=400)

        ed = get_object_or_404(Edition, pk=pk)

        if "event_id" in payload:
            ed.event = get_object_or_404(Event, pk=payload["event_id"])
        elif "event_name" in payload:
            ev, _ = Event.objects.get_or_create(name=payload["event_name"])
            ed.event = ev

        if "year" in payload:
            ed.year = int(payload["year"])
        if "location" in payload:
            ed.location = payload.get("location", "")
        if "start_date" in payload:
            ed.start_date = _parse_date(payload.get("start_date"))
        if "end_date" in payload:
            ed.end_date = _parse_date(payload.get("end_date"))

        ed.save()
        return JsonResponse(_edition_to_dict(ed))

    def delete(self, request, pk):
        ed = get_object_or_404(Edition, pk=pk)
        ed.delete()
        return JsonResponse({}, status=204)

@method_decorator(csrf_exempt, name='dispatch')
class ArticleListCreateAPIView(View):
    def get(self, request):
        qs = Article.objects.select_related("edition", "edition__event").prefetch_related("authors").all()
        # support filters via query params: title, author, event
        title = request.GET.get('title')
        author = request.GET.get('author')
        event = request.GET.get('event')
        if title:
            qs = qs.filter(title__icontains=title)
        if author:
            qs = qs.filter(authors__name__icontains=author)
        if event:
            qs = qs.filter(edition__event__name__icontains=event)
        qs = qs.distinct()
        data = [_article_to_dict(a) for a in qs]
        return JsonResponse(data, safe=False)

    def post(self, request):
        # support JSON body or multipart/form-data for pdf uploads
        if request.content_type and request.content_type.startswith('application/json'):
            try:
                payload = json.loads(request.body.decode() or "{}")
            except json.JSONDecodeError:
                return JsonResponse({"error": "invalid json"}, status=400)
            file_obj = None
        else:
            payload = request.POST.dict()
            file_obj = request.FILES.get('pdf_file')

        title = payload.get("title")
        if not title:
            return JsonResponse({"error": "title is required"}, status=400)

        # edition: accept edition_id or (event_name + year) or (event_id + year)
        edition = None
        if "edition_id" in payload and payload.get("edition_id"):
            edition = get_object_or_404(Edition, pk=payload["edition_id"])
        else:
            event_id = payload.get("event_id")
            event_name = payload.get("event_name")
            year = payload.get("year")
            if year is None:
                return JsonResponse({"error": "year is required when not using edition_id"}, status=400)
            if event_id:
                event = get_object_or_404(Event, pk=event_id)
            elif event_name:
                event, _ = Event.objects.get_or_create(name=event_name)
            else:
                return JsonResponse({"error": "event_id or event_name required when not using edition_id"}, status=400)
            edition, _ = Edition.objects.get_or_create(event=event, year=int(year))

        article = Article.objects.create(
            title=title,
            abstract=payload.get("abstract", ""),
            pdf_url=payload.get("pdf_url", ""),
            pdf_file=file_obj,
            edition=edition,
            bibtex=payload.get("bibtex", ""),
        )

        # authors: accept list of names
        authors = payload.get("authors", [])
        if isinstance(authors, list):
            for name in authors:
                if not name:
                    continue
                author, _ = Author.objects.get_or_create(name=name)
                article.authors.add(author)

        article.save()
        return JsonResponse(_article_to_dict(article), status=201)


@method_decorator(csrf_exempt, name='dispatch')
class ArticleDetailView(View):
    def get(self, request, pk):
        a = get_object_or_404(Article.objects.select_related('edition', 'edition__event').prefetch_related('authors'), pk=pk)
        return JsonResponse(_article_to_dict(a))

    def put(self, request, pk):
        a = get_object_or_404(Article, pk=pk)
        # accept json or multipart
        if request.content_type and request.content_type.startswith('application/json'):
            try:
                payload = json.loads(request.body.decode() or "{}")
            except json.JSONDecodeError:
                return JsonResponse({"error": "invalid json"}, status=400)
            file_obj = None
        else:
            payload = request.POST.dict()
            file_obj = request.FILES.get('pdf_file')

        if 'title' in payload:
            a.title = payload.get('title')
        if 'abstract' in payload:
            a.abstract = payload.get('abstract', '')
        if 'pdf_url' in payload:
            a.pdf_url = payload.get('pdf_url', '')
        if file_obj:
            a.pdf_file = file_obj
        # edition handling
        if 'edition_id' in payload and payload.get('edition_id'):
            a.edition = get_object_or_404(Edition, pk=payload.get('edition_id'))
        elif 'event_name' in payload and 'year' in payload:
            ev, _ = Event.objects.get_or_create(name=payload.get('event_name'))
            ed, _ = Edition.objects.get_or_create(event=ev, year=int(payload.get('year')))
            a.edition = ed

        # authors: list of names
        authors = payload.get('authors')
        if isinstance(authors, list):
            a.authors.clear()
            for name in authors:
                if not name:
                    continue
                author, _ = Author.objects.get_or_create(name=name)
                a.authors.add(author)

        a.save()
        return JsonResponse(_article_to_dict(a))

    def delete(self, request, pk):
        a = get_object_or_404(Article, pk=pk)
        a.delete()
        return JsonResponse({}, status=204)


@method_decorator(csrf_exempt, name='dispatch')
class AuthorArticlesView(View):
    def get(self, request, pk):
        author = get_object_or_404(Author, pk=pk)
        qs = author.articles.select_related('edition', 'edition__event').all().order_by('edition__year')
        # group by year
        grouped = {}
        for art in qs:
            year = art.edition.year
            grouped.setdefault(year, []).append(_article_to_dict(art))
        return JsonResponse(grouped)


@method_decorator(csrf_exempt, name='dispatch')
class SubscriptionCreateView(View):
    def post(self, request):
        try:
            payload = json.loads(request.body.decode() or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid json"}, status=400)
        email = payload.get('email')
        if not email:
            return JsonResponse({"error": "email required"}, status=400)
        author_id = payload.get('author')
        event_id = payload.get('event')
        author = None
        event = None
        if author_id:
            author = get_object_or_404(Author, pk=author_id)
        if event_id:
            event = get_object_or_404(Event, pk=event_id)
        sub = Subscription.objects.create(email=email, author=author, event=event)
        return JsonResponse({"id": sub.id, "email": sub.email}, status=201)


@method_decorator(csrf_exempt, name='dispatch')
class SubscriptionListView(View):
    def get(self, request):
        subs = Subscription.objects.all().values('id', 'email', 'author_id', 'event_id', 'created_at')
        return JsonResponse(list(subs), safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class EventListCreateView(View):
    def get(self, request):
        events = Event.objects.all()
        data = [{"id": e.id, "name": e.name, "description": e.description or ""} for e in events]
        return JsonResponse(data, safe=False)
    
    def post(self, request):
        try:
            payload = json.loads(request.body.decode() or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid json"}, status=400)
        
        name = payload.get("name")
        if not name:
            return JsonResponse({"error": "name is required"}, status=400)
        
        event = Event.objects.create(
            name=name,
            description=payload.get("description", "")
        )
        return JsonResponse({"id": event.id, "name": event.name, "description": event.description}, status=201)

@method_decorator(csrf_exempt, name='dispatch')
class EventDetailView(View):
    def get(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        return JsonResponse({"id": event.id, "name": event.name, "description": event.description})
    
    def put(self, request, pk):
        try:
            payload = json.loads(request.body.decode() or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid json"}, status=400)
        
        event = get_object_or_404(Event, pk=pk)
        
        if "name" in payload:
            event.name = payload["name"]
        if "description" in payload:
            event.description = payload.get("description", "")
        
        event.save()
        return JsonResponse({"id": event.id, "name": event.name, "description": event.description})
    
    def delete(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        event.delete()
        return JsonResponse({}, status=204)