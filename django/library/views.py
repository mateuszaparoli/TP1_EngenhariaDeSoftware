from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json
from datetime import date

from .models import Edition, Event, Article, Author

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
        data = [_article_to_dict(a) for a in qs]
        return JsonResponse(data, safe=False)

    def post(self, request):
        try:
            payload = json.loads(request.body.decode() or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid json"}, status=400)

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