const API_URL = 'http://localhost:8000';

export type EventItem = {
  id?: number;
  name: string;
  description?: string;
};

export type EditionItem = {
  id?: number;
  event_id?: number;
  event_name?: string;
  event?: { id: number; name: string };
  year: number;
  location?: string;
  start_date?: string;
  end_date?: string;
};

export type AuthorItem = {
  id: number;
  name: string;
  email?: string | null;
};

export type ArticleItem = {
  id?: number;
  title: string;
  abstract?: string;
  pdf_url?: string;
  edition_id?: number;
  edition?: EditionItem;
  authors?: AuthorItem[];  // For displaying data from backend
  start_page?: string;
  end_page?: string;
  bibtex?: string;
  created_at?: string;
};

export type ArticlePayload = {
  title: string;
  abstract?: string;
  edition_id?: number;
  authors?: string[];  // For sending data to backend (just names)
  bibtex?: string;
};

export type BulkImportResponse = {
  success: boolean;
  created_count: number;
  skipped_count: number;
  error_count: number;
  articles: ArticleItem[];
  skipped_articles: {
    title: string;
    reason: string;
    missing_fields: string[];
  }[];
  processing_errors: {
    title: string;
    reason: string;
  }[];
  report: {
    summary: {
      total_entries_processed: number;
      successful_imports: number;
      skipped_entries: number;
      processing_errors: number;
      success_rate: number;
      pdf_files_in_zip: number;
      pdfs_successfully_matched: number;
    };
    details: {
      skipped_breakdown: Record<string, number>;
      most_common_skip_reasons: [string, number][];
    };
  };
  pdf_matches?: number;
};

export type BulkImportPayload = {
  edition_id?: number;
  event_name?: string;  // Keep for backward compatibility
  year?: number;        // Keep for backward compatibility
  bibtex_content?: string;
};

export type AuthorPageData = {
  author: AuthorItem;
  total_articles: number;
  years: number[];
  articles_by_year: Record<number, ArticleItem[]>;
};

async function handleRes(res: Response) {
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  console.log(json);
  if (!res.ok) throw new Error(json?.error || res.statusText);
  return json;
}

export async function getEvents(): Promise<EventItem[]> {
  const res = await fetch(`${API_URL}/api/events/`);
  return handleRes(res);
}

export async function createEvent(payload: EventItem): Promise<EventItem> {
  const res = await fetch(`${API_URL}/api/events/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function updateEvent(id: number, payload: Partial<EventItem>): Promise<EventItem> {
  const res = await fetch(`${API_URL}/api/events/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function deleteEvent(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/events/${id}/`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) await handleRes(res);
}

export async function getEditions(): Promise<EditionItem[]> {
  const res = await fetch(`${API_URL}/api/editions/`);
  return handleRes(res);
}

export async function createEdition(payload: EditionItem): Promise<EditionItem> {
  const res = await fetch(`${API_URL}/api/editions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function updateEdition(id: number, payload: Partial<EditionItem>): Promise<EditionItem> {
  const res = await fetch(`${API_URL}/api/editions/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function deleteEdition(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/editions/${id}/`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) await handleRes(res);
}

export async function getArticles(): Promise<ArticleItem[]> {
  const res = await fetch(`${API_URL}/api/articles/`);
  return handleRes(res);
}

export async function createArticle(payload: ArticlePayload, pdfFile?: File): Promise<ArticleItem> {
  const formData = new FormData();
  formData.append('title', payload.title);
  if (payload.abstract) formData.append('abstract', payload.abstract);
  if (payload.edition_id) formData.append('edition_id', payload.edition_id.toString());
  if (payload.bibtex) formData.append('bibtex', payload.bibtex);
  if (payload.authors && payload.authors.length > 0) {
    formData.append('authors', JSON.stringify(payload.authors));
  }
  if (pdfFile) {
    console.log('Uploading PDF file:', pdfFile.name, pdfFile.size, pdfFile.type);
    formData.append('pdf_file', pdfFile);
  }

  const res = await fetch(`${API_URL}/api/articles/`, {
    method: 'POST',
    body: formData,
  });
  return handleRes(res);
}

export async function updateArticle(id: number, payload: Partial<ArticlePayload>, pdfFile?: File): Promise<ArticleItem> {
  const formData = new FormData();
  if (payload.title) formData.append('title', payload.title);
  if (payload.abstract !== undefined) formData.append('abstract', payload.abstract);
  if (payload.edition_id) formData.append('edition_id', payload.edition_id.toString());
  if (payload.bibtex !== undefined) formData.append('bibtex', payload.bibtex);
  if (payload.authors && payload.authors.length > 0) {
    formData.append('authors', JSON.stringify(payload.authors));
  }
  if (pdfFile) {
    console.log('Uploading PDF file:', pdfFile.name, pdfFile.size, pdfFile.type);
    formData.append('pdf_file', pdfFile);
  }

  const res = await fetch(`${API_URL}/api/articles/${id}/`, {
    method: 'PUT',
    body: formData,
  });
  return handleRes(res);
}

export async function deleteArticle(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/articles/${id}/`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) await handleRes(res);
}

export async function getAuthorArticles(authorId: number): Promise<any> {
  const res = await fetch(`${API_URL}/api/authors/${authorId}/articles/`);
  return handleRes(res);
}

export async function createSubscription(payload: { email: string; author?: number; event?: number }): Promise<any> {
  const res = await fetch(`${API_URL}/api/subscriptions/create/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function listSubscriptions(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/subscriptions/`);
  return handleRes(res);
}

export async function bulkImportArticles(payload: BulkImportPayload, bibtexFile?: File, pdfZipFile?: File): Promise<BulkImportResponse> {
  const formData = new FormData();
  
  // Use edition_id if provided, otherwise fall back to event_name + year
  if (payload.edition_id) {
    formData.append('edition_id', payload.edition_id.toString());
  } else if (payload.event_name && payload.year) {
    formData.append('event_name', payload.event_name);
    formData.append('year', payload.year.toString());
  }
  
  if (bibtexFile) {
    formData.append('bibtex_file', bibtexFile);
  } else if (payload.bibtex_content) {
    // If no file but content is provided, send as JSON
    const res = await fetch(`${API_URL}/api/articles/bulk-import/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleRes(res);
  }

  // Add PDF ZIP file if provided
  if (pdfZipFile) {
    formData.append('pdf_zip', pdfZipFile);
  }

  const res = await fetch(`${API_URL}/api/articles/bulk-import/`, {
    method: 'POST',
    body: formData,
  });
  return handleRes(res);
}

export async function getAuthorByName(authorName: string): Promise<AuthorPageData> {
  const res = await fetch(`${API_URL}/api/authors/${authorName}/`);
  return handleRes(res);
}