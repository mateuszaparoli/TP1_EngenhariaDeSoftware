import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Event {
  id: string;
  name: string;
  description: string;
  category: string;
  editions: EventEdition[];
}

interface EventEdition {
  id: string;
  eventId: string;
  year: number;
  location: string;
  date: string;
}

const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEditionDialogOpen, setIsEditionDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingEdition, setEditingEdition] = useState<EventEdition | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    category: "",
  });

  const [editionForm, setEditionForm] = useState({
    year: new Date().getFullYear(),
    location: "",
    date: "",
  });

  useEffect(() => {
    const storedEvents = localStorage.getItem("events");
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  const saveEvents = (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));
  };

  const handleSaveEvent = () => {
    if (editingEvent) {
      const updatedEvents = events.map((e) =>
        e.id === editingEvent.id ? { ...editingEvent, ...eventForm } : e
      );
      saveEvents(updatedEvents);
      toast.success("Event updated successfully");
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...eventForm,
        editions: [],
      };
      saveEvents([...events, newEvent]);
      toast.success("Event created successfully");
    }
    setIsEventDialogOpen(false);
    resetEventForm();
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter((e) => e.id !== id);
    saveEvents(updatedEvents);
    toast.success("Event deleted successfully");
  };

  const handleSaveEdition = () => {
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) return;

    let updatedEditions;
    if (editingEdition) {
      updatedEditions = event.editions.map((ed) =>
        ed.id === editingEdition.id ? { ...editingEdition, ...editionForm } : ed
      );
      toast.success("Edition updated successfully");
    } else {
      const newEdition: EventEdition = {
        id: Date.now().toString(),
        eventId: selectedEventId,
        ...editionForm,
      };
      updatedEditions = [...event.editions, newEdition];
      toast.success("Edition created successfully");
    }

    const updatedEvents = events.map((e) =>
      e.id === selectedEventId ? { ...e, editions: updatedEditions } : e
    );
    saveEvents(updatedEvents);
    setIsEditionDialogOpen(false);
    resetEditionForm();
  };

  const handleDeleteEdition = (eventId: string, editionId: string) => {
    const updatedEvents = events.map((e) =>
      e.id === eventId
        ? { ...e, editions: e.editions.filter((ed) => ed.id !== editionId) }
        : e
    );
    saveEvents(updatedEvents);
    toast.success("Edition deleted successfully");
  };

  const openEventDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        name: event.name,
        description: event.description,
        category: event.category,
      });
    }
    setIsEventDialogOpen(true);
  };

  const openEditionDialog = (eventId: string, edition?: EventEdition) => {
    setSelectedEventId(eventId);
    if (edition) {
      setEditingEdition(edition);
      setEditionForm({
        year: edition.year,
        location: edition.location,
        date: edition.date,
      });
    }
    setIsEditionDialogOpen(true);
  };

  const resetEventForm = () => {
    setEditingEvent(null);
    setEventForm({ name: "", description: "", category: "" });
  };

  const resetEditionForm = () => {
    setEditingEdition(null);
    setEditionForm({ year: new Date().getFullYear(), location: "", date: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Events Management</h2>
          <p className="text-muted-foreground">Manage events and their editions</p>
        </div>
        <Button onClick={() => openEventDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{event.name}</CardTitle>
                <CardDescription>{event.category}</CardDescription>
                <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEventDialog(event)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Editions</h3>
              <Button variant="outline" size="sm" onClick={() => openEditionDialog(event.id)}>
                <Calendar className="w-4 h-4 mr-2" />
                Add Edition
              </Button>
            </div>
            {event.editions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.editions.map((edition) => (
                    <TableRow key={edition.id}>
                      <TableCell>{edition.year}</TableCell>
                      <TableCell>{edition.location}</TableCell>
                      <TableCell>{edition.date}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditionDialog(event.id, edition)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEdition(event.id, edition.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No editions yet. Click "Add Edition" to create one.
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {events.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No events yet. Create your first event to get started.</p>
          </CardContent>
        </Card>
      )}

      {/* Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update event information" : "Add a new event to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={eventForm.category}
                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edition Dialog */}
      <Dialog open={isEditionDialogOpen} onOpenChange={setIsEditionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEdition ? "Edit Edition" : "Create Edition"}</DialogTitle>
            <DialogDescription>
              {editingEdition ? "Update edition information" : "Add a new edition to the event"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={editionForm.year}
                onChange={(e) => setEditionForm({ ...editionForm, year: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editionForm.location}
                onChange={(e) => setEditionForm({ ...editionForm, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={editionForm.date}
                onChange={(e) => setEditionForm({ ...editionForm, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdition}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsManager;
