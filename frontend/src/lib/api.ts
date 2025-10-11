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