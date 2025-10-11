const API_URL = 'http://localhost:8000';

export type EventItem = {
  id?: number;
  name: string;
  description?: string;
};

async function handleRes(res: Response) {
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
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

export async function getEditions(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/editions/`);
  return handleRes(res);
}

export async function getArticles(filters?: { title?: string; author?: string; event?: string }): Promise<any[]> {
  const qs = new URLSearchParams();
  if (filters?.title) qs.set('title', filters.title);
  if (filters?.author) qs.set('author', filters.author);
  if (filters?.event) qs.set('event', filters.event);
  const url = `${API_URL}/api/articles/` + (qs.toString() ? `?${qs.toString()}` : '');
  const res = await fetch(url);
  return handleRes(res);
}

export async function createArticle(payload: any, file?: File): Promise<any> {
  if (file) {
    const form = new FormData();
    form.append('title', payload.title);
    if (payload.abstract) form.append('abstract', payload.abstract);
    if (payload.event_name) form.append('event_name', payload.event_name);
    if (payload.year) form.append('year', String(payload.year));
    if (payload.authors) form.append('authors', payload.authors);
    if (payload.pdf_url) form.append('pdf_url', payload.pdf_url);
    form.append('pdf_file', file);
    const res = await fetch(`${API_URL}/api/articles/`, { method: 'POST', body: form });
    return handleRes(res);
  }
  const res = await fetch(`${API_URL}/api/articles/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function updateArticle(id: number, payload: any, file?: File): Promise<any> {
  if (file) {
    const form = new FormData();
    if (payload.title) form.append('title', payload.title);
    if (payload.abstract) form.append('abstract', payload.abstract);
    if (payload.event_name) form.append('event_name', payload.event_name);
    if (payload.year) form.append('year', String(payload.year));
    if (payload.authors) form.append('authors', payload.authors);
    form.append('pdf_file', file);
    const res = await fetch(`${API_URL}/api/articles/${id}/`, { method: 'PUT', body: form });
    return handleRes(res);
  }
  const res = await fetch(`${API_URL}/api/articles/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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