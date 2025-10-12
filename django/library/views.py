from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from datetime import date
import json
import re  # Add this import

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
    pdf_url = a.pdf_url or ""
    if a.pdf_file:
        # Use request to build full URL or just the path
        pdf_url = f"http://localhost:8000{a.pdf_file.url}"  # or just a.pdf_file.url
    
    return {
        "id": a.id,
        "title": a.title,
        "abstract": a.abstract or None,
        "pdf_url": pdf_url or None,
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
            # For author search, find names that contain the search term as a complete word
            author_clean = author.strip()
            # Use regex to match complete words (word boundaries)
            from django.db.models import Q
            import re
            
            # Escape special regex characters in the search term
            escaped_term = re.escape(author_clean)
            # Create regex pattern for word boundary matching (case insensitive)
            regex_pattern = r'\b' + escaped_term + r'\b'
            
            qs = qs.filter(authors__name__iregex=regex_pattern)
        if event:
            qs = qs.filter(edition__event__name__icontains=event)
        qs = qs.distinct()
        data = [_article_to_dict(a) for a in qs]
        return JsonResponse(data, safe=False)

    def post(self, request):
        print(f"Content-Type: {request.content_type}")  # Debug
        print(f"FILES: {request.FILES}")  # Debug
        print(f"POST: {request.POST}")  # Debug
        
        # Handle multipart/form-data for file uploads
        if 'pdf_file' in request.FILES or request.POST:
            title = request.POST.get("title")
            if not title:
                return JsonResponse({"error": "title is required"}, status=400)

            # Get edition
            edition = None
            edition_id = request.POST.get("edition_id")
            if edition_id:
                edition = get_object_or_404(Edition, pk=edition_id)

            article = Article.objects.create(
                title=title,
                abstract=request.POST.get("abstract", ""),
                pdf_url=request.POST.get("pdf_url", ""),
                edition=edition,
                bibtex=request.POST.get("bibtex", ""),
            )

            # Handle file upload
            if 'pdf_file' in request.FILES:
                print(f"Saving PDF file: {request.FILES['pdf_file'].name}")  # Debug
                article.pdf_file = request.FILES['pdf_file']
                article.save()
                print(f"PDF saved at: {article.pdf_file.path}")  # Debug

            # Handle authors
            authors_str = request.POST.get("authors", "")
            if authors_str:
                try:
                    authors = json.loads(authors_str)
                    for name in authors:
                        if not name:
                            continue
                        author, _ = Author.objects.get_or_create(name=name)
                        article.authors.add(author)
                except json.JSONDecodeError:
                    pass

            return JsonResponse(_article_to_dict(article), status=201)

        # Handle JSON payload (backward compatibility)
        try:
            payload = json.loads(request.body.decode() or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid json"}, status=400)

        title = payload.get("title")
        if not title:
            return JsonResponse({"error": "title is required"}, status=400)

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
                return JsonResponse({"error": "event_id or event_name required"}, status=400)
            edition, _ = Edition.objects.get_or_create(event=event, year=int(year))

        article = Article.objects.create(
            title=title,
            abstract=payload.get("abstract", ""),
            pdf_url=payload.get("pdf_url", ""),
            edition=edition,
            bibtex=payload.get("bibtex", ""),
        )

        # authors: accept list of names or comma/semicolon-separated string
        authors = payload.get("authors", [])
        if isinstance(authors, list):
            names = authors
        elif isinstance(authors, str):
            # support comma or semicolon separated lists
            parts = [p.strip() for p in authors.replace(';', ',').split(',')]
            names = [p for p in parts if p]
        else:
            names = []

        for name in names:
            author, _ = Author.objects.get_or_create(name=name)
            article.authors.add(author)

        article.save()
        return JsonResponse(_article_to_dict(article))

    def delete(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        # Delete file if exists
        if article.pdf_file:
            import os
            if os.path.isfile(article.pdf_file.path):
                os.remove(article.pdf_file.path)
        article.delete()
        return JsonResponse({}, status=204)

@method_decorator(csrf_exempt, name='dispatch')
class ArticleDetailView(View):
    def get(self, request, pk):
        article = get_object_or_404(
            Article.objects.select_related("edition", "edition__event").prefetch_related("authors"),
            pk=pk
        )
        return JsonResponse(_article_to_dict(article))

    def put(self, request, pk):
        print(f"=== UPDATE ARTICLE {pk} ===")
        print(f"Content-Type: {request.content_type}")
        print(f"Request method: {request.method}")
        
        article = get_object_or_404(Article, pk=pk)
        print(f"BEFORE UPDATE - Edition: {article.edition_id}, Title: {article.title}")

        # Handle multipart/form-data for file uploads
        # Django doesn't automatically parse PUT requests with multipart/form-data
        if request.content_type and 'multipart/form-data' in request.content_type:
            from django.http import QueryDict
            import io
            
            # Parse the request body manually for PUT
            try:
                # Use Django's MultiPartParser
                from django.http.multipartparser import MultiPartParser
                
                # Parse the multipart data
                parser = MultiPartParser(request.META, io.BytesIO(request.body), request.upload_handlers, request.encoding or 'utf-8')
                parsed_data, parsed_files = parser.parse()
                print(f"Parsed POST data: {dict(parsed_data)}")
                print(f"Parsed FILES: {list(parsed_files.keys())}")
            except Exception as e:
                print(f"Error parsing multipart data: {e}")
                import traceback
                traceback.print_exc()
                parsed_data = QueryDict()
                parsed_files = {}
            
            if "title" in parsed_data:
                print(f"Updating title to: {parsed_data['title']}")  # Debug
                article.title = parsed_data["title"]
            if "abstract" in parsed_data:
                article.abstract = parsed_data.get("abstract", "")
            if "pdf_url" in parsed_data:
                article.pdf_url = parsed_data.get("pdf_url", "")
            if "bibtex" in parsed_data:
                article.bibtex = parsed_data.get("bibtex", "")
            
            # Handle edition
            if "edition_id" in parsed_data:
                print(f"Updating edition to: {parsed_data['edition_id']}")  # Debug
                article.edition = get_object_or_404(Edition, pk=parsed_data["edition_id"])

            # Handle file upload
            if 'pdf_file' in parsed_files:
                print(f"Updating PDF file: {parsed_files['pdf_file'].name}")  # Debug
                article.pdf_file = parsed_files['pdf_file']

            # Handle authors
            authors_str = parsed_data.get("authors")
            if authors_str:
                print(f"Updating authors: {authors_str}")  # Debug
                try:
                    authors = json.loads(authors_str)
                    article.authors.clear()
                    for name in authors:
                        if not name:
                            continue
                        author, created = Author.objects.get_or_create(name=name)
                        print(f"Adding author: {author.name} (created: {created})")  # Debug
                        article.authors.add(author)
                except json.JSONDecodeError as e:
                    print(f"Error parsing authors JSON: {e}")  # Debug

            article.save()
            print(f"AFTER UPDATE - Edition: {article.edition_id}, Title: {article.title}")
            print(f"Article saved successfully")  # Debug
            
            # Refresh the article with related data
            article.refresh_from_db()
            article = Article.objects.select_related("edition", "edition__event").prefetch_related("authors").get(pk=article.id)
            
            return JsonResponse(_article_to_dict(article))

        # Handle JSON payload
        try:
            payload = json.loads(request.body.decode() or "{}")
            print(f"JSON payload: {payload}")  # Debug
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid json"}, status=400)

        if "title" in payload:
            article.title = payload["title"]
        if "abstract" in payload:
            article.abstract = payload.get("abstract", "")
        if "pdf_url" in payload:
            article.pdf_url = payload.get("pdf_url", "")
        if "bibtex" in payload:
            article.bibtex = payload.get("bibtex", "")
        
        if "edition_id" in payload:
            article.edition = get_object_or_404(Edition, pk=payload["edition_id"])

        if "authors" in payload:
            article.authors.clear()
            for name in payload["authors"]:
                if not name:
                    continue
                author, _ = Author.objects.get_or_create(name=name)
                article.authors.add(author)

        article.save()
        return JsonResponse(_article_to_dict(article))

    def delete(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        # Delete file if exists
        if article.pdf_file:
            import os
            if os.path.isfile(article.pdf_file.path):
                os.remove(article.pdf_file.path)
        article.delete()
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
class AuthorByNameView(View):
    def get(self, request, author_name):
        """Get author and their articles by name slug"""
        # Convert slug back to name (replace hyphens with spaces)
        name = author_name.replace('-', ' ')
        
        try:
            # Try exact match first
            author = Author.objects.get(name__iexact=name)
        except Author.DoesNotExist:
            # Try partial match if exact doesn't work
            authors = Author.objects.filter(name__icontains=name)
            if not authors.exists():
                return JsonResponse({"error": "Author not found"}, status=404)
            author = authors.first()  # Take the first match
        
        # Get articles grouped by year
        qs = author.articles.select_related('edition', 'edition__event').all().order_by('-edition__year')
        
        grouped_by_year = {}
        total_articles = 0
        
        for article in qs:
            year = article.edition.year
            if year not in grouped_by_year:
                grouped_by_year[year] = []
            grouped_by_year[year].append(_article_to_dict(article))
            total_articles += 1
        
        # Sort years in descending order
        sorted_years = sorted(grouped_by_year.keys(), reverse=True)
        
        return JsonResponse({
            "author": _author_to_dict(author),
            "total_articles": total_articles,
            "years": sorted_years,
            "articles_by_year": grouped_by_year
        })


@method_decorator(csrf_exempt, name='dispatch')
class SubscriptionCreateView(View):
    def post(self, request):
        try:
            payload = json.loads(request.body.decode() or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid json"}, status=400)
        
        email = payload.get('email')
        name = payload.get('name')  # Nome do autor para criar subscription
        
        if not email:
            return JsonResponse({"error": "email required"}, status=400)
        if not name:
            return JsonResponse({"error": "name required"}, status=400)
        
        # Buscar ou criar o autor baseado no nome
        author, created = Author.objects.get_or_create(name=name.strip())
        
        # Verificar se já existe uma subscription para este email e autor
        existing_subscription = Subscription.objects.filter(email=email, author=author).first()
        if existing_subscription:
            return JsonResponse({
                "message": "Subscription already exists",
                "id": existing_subscription.id,
                "email": existing_subscription.email,
                "author": author.name
            }, status=200)
        
        # Criar nova subscription
        sub = Subscription.objects.create(email=email, author=author)
        
        return JsonResponse({
            "id": sub.id,
            "email": sub.email,
            "author": author.name,
            "message": "Subscription created successfully"
        }, status=201)


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

@method_decorator(csrf_exempt, name='dispatch')
class BulkImportArticlesView(View):
    def post(self, request):
        """Import multiple articles from BibTeX format"""
        try:
            if 'bibtex_file' in request.FILES:
                # Handle file upload
                bibtex_content = request.FILES['bibtex_file'].read().decode('utf-8')
            elif request.POST.get('bibtex_content'):
                # Handle FormData with bibtex_content as text field
                bibtex_content = request.POST.get('bibtex_content')
            else:
                # Handle JSON payload with bibtex content (fallback for backward compatibility)
                try:
                    payload = json.loads(request.body.decode() or "{}")
                    bibtex_content = payload.get('bibtex_content', '')
                except (json.JSONDecodeError, UnicodeDecodeError):
                    bibtex_content = ''
                
            if not bibtex_content:
                return JsonResponse({"error": "No BibTeX content provided"}, status=400)
            
            # Get edition info - now we expect edition_id from frontend
            edition_id = request.POST.get('edition_id')
            if not edition_id:
                try:
                    payload = json.loads(request.body.decode() or "{}")
                    edition_id = payload.get('edition_id')
                except (json.JSONDecodeError, UnicodeDecodeError):
                    pass
            
            if edition_id:
                # Use specific edition selected in frontend
                try:
                    edition = Edition.objects.get(pk=int(edition_id))
                except Edition.DoesNotExist:
                    return JsonResponse({"error": "Selected edition not found"}, status=400)
            else:
                # Fallback to old behavior for backward compatibility
                event_name = request.POST.get('event_name')
                year = request.POST.get('year')
                
                if not event_name or not year:
                    try:
                        payload = json.loads(request.body.decode() or "{}")
                        event_name = payload.get('event_name')
                        year = payload.get('year')
                    except (json.JSONDecodeError, UnicodeDecodeError):
                        pass
                
                if not event_name or not year:
                    return JsonResponse({"error": "edition_id or (event_name and year) are required"}, status=400)
                
                # Get or create event and edition
                event, _ = Event.objects.get_or_create(name=event_name)
                try:
                    edition = Edition.objects.get(event=event, year=int(year))
                except Edition.DoesNotExist:
                    return JsonResponse({"error": f"No edition found for {event_name} {year}. Please create the edition first."}, status=400)
                except Edition.MultipleObjectsReturned:
                    return JsonResponse({"error": f"Multiple editions found for {event_name} {year}. Please specify edition_id."}, status=400)
            
            # Handle ZIP file with PDFs
            pdf_files = {}
            if 'pdf_zip' in request.FILES:
                pdf_files = self._extract_pdfs_from_zip(request.FILES['pdf_zip'])
            
            # Parse BibTeX entries
            articles_data = self._parse_bibtex(bibtex_content)
            
            created_articles = []
            skipped_articles = []
            processing_errors = []
            
            for entry_index, article_data in enumerate(articles_data, 1):
                # Validate required fields
                validation_result = self._validate_article_data(article_data, entry_index)
                
                if not validation_result['valid']:
                    skipped_articles.append({
                        'title': article_data.get('title', f'Entry #{entry_index}'),
                        'reason': validation_result['reason'],
                        'missing_fields': validation_result['missing_fields']
                    })
                    continue
                
                try:
                    # Create article
                    article = Article.objects.create(
                        title=article_data.get('title', ''),
                        abstract=article_data.get('abstract', ''),
                        pdf_url=article_data.get('url', ''),
                        edition=edition,
                        bibtex=article_data.get('bibtex_entry', ''),
                    )
                    
                    # Try to match PDF file from ZIP
                    pdf_file = self._find_matching_pdf(article_data, pdf_files)
                    if pdf_file:
                        # Use the save method of FileField to properly save the file
                        article.pdf_file.save(pdf_file['name'], pdf_file['content'], save=True)
                    
                    # Add authors
                    authors = article_data.get('authors', [])
                    for author_name in authors:
                        if author_name.strip():
                            author, _ = Author.objects.get_or_create(name=author_name.strip())
                            article.authors.add(author)
                    
                    created_articles.append(_article_to_dict(article))
                    
                except Exception as e:
                    processing_errors.append({
                        'title': article_data.get('title', f'Entry #{entry_index}'),
                        'reason': f"Database error: {str(e)}"
                    })
            
            # Generate summary report
            report = self._generate_import_report(created_articles, skipped_articles, processing_errors, pdf_files)
            
            return JsonResponse({
                "success": True,
                "created_count": len(created_articles),
                "skipped_count": len(skipped_articles),
                "error_count": len(processing_errors),
                "articles": created_articles,
                "skipped_articles": skipped_articles,
                "processing_errors": processing_errors,
                "report": report,
                "pdf_matches": len([a for a in created_articles if a.get('pdf_url') and 'localhost:8000' in str(a.get('pdf_url', ''))])
            }, status=201)
            
        except Exception as e:
            return JsonResponse({"error": f"Import failed: {str(e)}"}, status=400)
    
    def _validate_article_data(self, article_data, entry_index):
        """Validate that article has all required fields"""
        required_fields = ['title', 'year']  # Title and year are mandatory
        recommended_fields = ['authors']  # Authors are highly recommended
        
        missing_required = []
        missing_recommended = []
        
        # Check required fields
        for field in required_fields:
            value = article_data.get(field)
            if not value or (isinstance(value, str) and not value.strip()):
                missing_required.append(field)
        
        # Check recommended fields
        for field in recommended_fields:
            if not article_data.get(field) or (isinstance(article_data.get(field), list) and len(article_data.get(field)) == 0):
                missing_recommended.append(field)
        
        # Validate title length (minimum meaningful length)
        title = article_data.get('title', '').strip()
        if title and len(title) < 3:
            missing_required.append('title (too short)')
        
        # Validate year format
        year = article_data.get('year')
        if year:
            try:
                year_int = int(year)
                if year_int < 1900 or year_int > 2030:
                    missing_required.append('year (invalid range)')
            except (ValueError, TypeError):
                missing_required.append('year (invalid format)')
        
        # Generate validation result
        if missing_required:
            return {
                'valid': False,
                'reason': f"Missing required fields: {', '.join(missing_required)}",
                'missing_fields': missing_required + missing_recommended
            }
        
        # Warn about missing recommended fields but don't skip
        warnings = []
        if missing_recommended:
            warnings.append(f"Missing recommended fields: {', '.join(missing_recommended)}")
        
        return {
            'valid': True,
            'reason': None,
            'missing_fields': missing_recommended,
            'warnings': warnings
        }
    
    def _generate_import_report(self, created_articles, skipped_articles, processing_errors, pdf_files):
        """Generate a comprehensive import report"""
        total_entries = len(created_articles) + len(skipped_articles) + len(processing_errors)
        success_rate = (len(created_articles) / total_entries * 100) if total_entries > 0 else 0
        
        report = {
            'summary': {
                'total_entries_processed': total_entries,
                'successful_imports': len(created_articles),
                'skipped_entries': len(skipped_articles),
                'processing_errors': len(processing_errors),
                'success_rate': round(success_rate, 1),
                'pdf_files_in_zip': len(pdf_files),
                'pdfs_successfully_matched': len([a for a in created_articles if a.get('pdf_url') and 'localhost:8000' in str(a.get('pdf_url', ''))])
            },
            'details': {
                'skipped_breakdown': {},
                'most_common_skip_reasons': []
            }
        }
        
        # Analyze skip reasons
        skip_reasons = {}
        for skipped in skipped_articles:
            reason = skipped['reason']
            skip_reasons[reason] = skip_reasons.get(reason, 0) + 1
        
        report['details']['skipped_breakdown'] = skip_reasons
        report['details']['most_common_skip_reasons'] = sorted(skip_reasons.items(), key=lambda x: x[1], reverse=True)
        
        return report

    def _extract_pdfs_from_zip(self, zip_file):
        """Extract PDF files from uploaded ZIP"""
        import zipfile
        import os
        from django.core.files.base import ContentFile
        
        pdf_files = {}
        
        try:
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                for file_info in zip_ref.filelist:
                    if file_info.filename.lower().endswith('.pdf'):
                        # Extract PDF content
                        pdf_content = zip_ref.read(file_info.filename)
                        # Get just the filename without path
                        filename = os.path.basename(file_info.filename)
                        
                        # Store as dict with content and name
                        pdf_data = {
                            'content': ContentFile(pdf_content, name=filename),
                            'name': filename
                        }
                        
                        # Store with full filename (e.g., "sbes-paper1.pdf")
                        pdf_files[filename.lower()] = pdf_data
                        
                        # Also store without extension for matching (e.g., "sbes-paper1")
                        name_without_ext = os.path.splitext(filename)[0].lower()
                        pdf_files[name_without_ext] = pdf_data
                        
        except Exception as e:
            print(f"Error extracting ZIP: {e}")
            
        return pdf_files
    
    def _find_matching_pdf(self, article_data, pdf_files):
        """Try to find a matching PDF file for the article"""
        if not pdf_files:
            return None
        
        # First, try to extract the BibTeX key from the entry
        bibtex_entry = article_data.get('bibtex_entry', '')
        bibtex_key = None
        
        # Extract the BibTeX key (e.g., "sbes-paper1" from "@inproceedings{sbes-paper1,")
        key_match = re.search(r'@\w+\s*{\s*([^,\s]+)', bibtex_entry)
        if key_match:
            bibtex_key = key_match.group(1).strip()
        
        # Strategy 1: Try exact match with BibTeX key + .pdf
        if bibtex_key:
            exact_filename = f"{bibtex_key}.pdf".lower()
            if exact_filename in pdf_files:
                return pdf_files[exact_filename]
            
            # Also try the key without extension (in case it was stored that way)
            if bibtex_key.lower() in pdf_files:
                return pdf_files[bibtex_key.lower()]
        
        # Strategy 2: Try title-based matching (fallback)
        title = article_data.get('title', '').lower()
        
        # Try different matching strategies based on title
        possible_names = [
            # Clean title (remove special characters)
            re.sub(r'[^\w\s-]', '', title).replace(' ', '_'),
            re.sub(r'[^\w\s-]', '', title).replace(' ', '-'),
            re.sub(r'[^\w\s-]', '', title).replace(' ', ''),
            # First few words of title
            '_'.join(title.split()[:3]),
            '-'.join(title.split()[:3]),
            # Just first word
            title.split()[0] if title.split() else '',
        ]
        
        # Try to match with PDF files
        for name in possible_names:
            if name and name.lower() in pdf_files:
                return pdf_files[name.lower()]
                
        # If no match found, try partial matching
        for pdf_name in pdf_files.keys():
            # First try BibTeX key partial match
            if bibtex_key and bibtex_key.lower() in pdf_name.lower():
                return pdf_files[pdf_name]
            
            # Then try title-based partial match
            for name in possible_names:
                if name and len(name) > 3 and name.lower() in pdf_name.lower():
                    return pdf_files[pdf_name]
                    
        return None

    def _parse_bibtex(self, bibtex_content):
        """Parse BibTeX content and extract article information"""
        articles = []
        
        # Split entries by @article, @inproceedings, etc.
        entries = re.split(r'@\w+\s*{', bibtex_content)
        
        for entry in entries[1:]:  # Skip first empty split
            if not entry.strip():
                continue
                
            article_data = {
                'title': '',
                'authors': [],
                'abstract': '',
                'url': '',
                'year': '',
                'bibtex_entry': f"@article{{{entry}"
            }
            
            # Extract title
            title_match = re.search(r'title\s*=\s*[{"]([^"}]+)["}]', entry, re.IGNORECASE)
            if title_match:
                article_data['title'] = title_match.group(1).strip()
            
            # Extract authors
            author_match = re.search(r'author\s*=\s*[{"]([^"}]+)["}]', entry, re.IGNORECASE)
            if author_match:
                authors_str = author_match.group(1)
                # Split by "and" and clean up
                authors = [a.strip() for a in re.split(r'\s+and\s+', authors_str) if a.strip()]
                article_data['authors'] = authors
            
            # Extract year
            year_match = re.search(r'year\s*=\s*[{"]?(\d{4})["}]?', entry, re.IGNORECASE)
            if year_match:
                article_data['year'] = year_match.group(1).strip()
            
            # Extract abstract
            abstract_match = re.search(r'abstract\s*=\s*[{"]([^"}]+)["}]', entry, re.IGNORECASE)
            if abstract_match:
                article_data['abstract'] = abstract_match.group(1).strip()
            
            # Extract URL
            url_match = re.search(r'url\s*=\s*[{"]([^"}]+)["}]', entry, re.IGNORECASE)
            if url_match:
                article_data['url'] = url_match.group(1).strip()
            
            # Extract booktitle (for inproceedings)
            booktitle_match = re.search(r'booktitle\s*=\s*[{"]([^"}]+)["}]', entry, re.IGNORECASE)
            if booktitle_match:
                article_data['booktitle'] = booktitle_match.group(1).strip()
            
            # Extract journal (for articles)
            journal_match = re.search(r'journal\s*=\s*[{"]([^"}]+)["}]', entry, re.IGNORECASE)
            if journal_match:
                article_data['journal'] = journal_match.group(1).strip()
            
            # Extract pages
            pages_match = re.search(r'pages\s*=\s*[{"]([^"}]+)["}]', entry, re.IGNORECASE)
            if pages_match:
                article_data['pages'] = pages_match.group(1).strip()
            
            # Always add entry for processing (validation will handle missing fields)
            articles.append(article_data)
        
        return articles