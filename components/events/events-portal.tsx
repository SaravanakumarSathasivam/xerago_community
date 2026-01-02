"use client";

import {
  Key,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Share,
  CalendarDays,
  Video,
  Coffee,
  Presentation,
  Trophy,
} from "lucide-react";

import {
  getEvents,
  createEvent as apiCreateEvent,
  createEventForm,
  toggleRsvp,
  updateEvent,
  getEventAttendees,
} from "@/lib/api";
import Swal from 'sweetalert2'
import { useDropdownOptions } from "@/hooks/use-dropdown-options";
import { IEvent, IAttendee } from "@/models/event";
import { IUser } from '@/models/user';
import { IDropdownOption } from '@/models/dropdown-option';

interface INewEvent {
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  type: string;
  category: string;
  maxAttendees: string;
  tags: string;
}

interface IEditableEvent extends INewEvent {
  id: string;
}

interface IEventCategory {
  id: string;
  name: string;
  count: number;
}

interface EventsPortalProps {
  user: IUser;
}

export function EventsPortal({ user }: EventsPortalProps) {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [newEvent, setNewEvent] = useState<INewEvent>({
    title: "",
    description: "",
    date: "",
    endDate: "",
    location: "",
    type: "",
    category: "",
    maxAttendees: "",
    tags: "",
  });
  const [newEventErrors, setNewEventErrors] = useState<Record<string, string>>({});
  const [eventFiles, setEventFiles] = useState<File[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [attendeesDialogOpen, setAttendeesDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<IEditableEvent | null>(null);
  const [attendees, setAttendees] = useState<IAttendee[]>([]);

  // Fetch dropdown options from API
  const { options: eventTypes, loading: eventTypesLoading } = useDropdownOptions('event_type');
  const { options: eventCategories, loading: eventCategoriesLoading } = useDropdownOptions('event_category');
  const { options: sortOptions, loading: sortOptionsLoading } = useDropdownOptions('event_sort');

  useEffect(() => {
    (async () => {
      try {
        const res = await getEvents();
        setEvents(res.data.events || []);
      } catch (e: unknown) {
        console.error("Failed to fetch events:", e);
      }
    })();
  }, []);

  const isAdmin = user.role === "admin";

  const filteredEvents = events.filter((event: IEvent) => {
    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags?.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "registered" && event.attendees.some((attendee: IAttendee) => attendee.user === user.id)) ||
      (activeTab === "my-events" && (event.organizer as unknown as IUser).id === user.id);

    return matchesCategory && matchesSearch && matchesTab;
  });

  const sortedEvents = [...filteredEvents].sort((a: IEvent, b: IEvent) => {
    if (sortBy === "date") {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    } else if (sortBy === "popular") {
      return (b.attendees as IAttendee[]).length - (a.attendees as IAttendee[]).length;
    }
    return 0;
  });

  const handleRegister = async (eventId: string) => {
    try {
      const res = await toggleRsvp(eventId);
      const updated = res.data.event;
      setEvents((prev) => prev.map((e: IEvent) => (e._id === updated.id ? updated : e)));
    } catch (e: unknown) {
      console.error("Failed to toggle RSVP:", e);
    }
  };

  const handleCreateEvent = async () => {
    const errors: Record<string, string> = {};
    if (!newEvent.title) errors.title = "Event Title is required";
    if (!newEvent.description) errors.description = "Description is required";
    if (!newEvent.date) errors.date = "Start Date & Time is required";
    if (!newEvent.endDate) errors.endDate = "End Date & Time is required";
    if (!newEvent.location) errors.location = "Location is required";
    if (!newEvent.type) errors.type = "Type is required";
    if (!newEvent.category) errors.category = "Category is required";

    if (Object.keys(errors).length > 0) {
      setNewEventErrors(errors);
      return;
    }

    setNewEventErrors({}); // Clear previous errors
    try {
      const form = new FormData()
      form.append('title', newEvent.title)
      form.append('description', newEvent.description)
      form.append('startDate', new Date(newEvent.date).toISOString())
      form.append('endDate', new Date(newEvent.endDate || newEvent.date).toISOString())
      form.append('location', newEvent.location)
      form.append('type', newEvent.type)
      form.append('category', newEvent.category)
      form.append('maxAttendees', newEvent.maxAttendees)
      form.append('tags', newEvent.tags.split(',').map(tag => tag.trim()).filter(Boolean).join(','))
      eventFiles.forEach((f) => form.append('images', f))
      const res = await createEventForm(form);
      const created = res.data.event;
      setEvents((prev) => [created, ...prev]);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        endDate: "",
        location: "",
        type: "",
        category: "",
        maxAttendees: "",
        tags: "",
      });
      setEventFiles([])
      setIsCreateDialogOpen(false);
      Swal.fire({ icon: 'success', title: 'Event created', text: 'Your event was created successfully.' })
    } catch (e: unknown) {
      setNewEventErrors({
        apiError: (e as Error)?.message || "Failed to create event",
      });
      // Do not close the dialog
    }
  };

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "Workshop":
        return <Presentation className="w-4 h-4" />;
      case "Lunch & Learn":
        return <Coffee className="w-4 h-4" />;
      case "Team Building":
        return <Trophy className="w-4 h-4" />;
      case "Presentation":
        return <Video className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const categories: IEventCategory[] = [
    { id: "all", name: "All Categories", count: events.length },
    ...eventCategories.map((cat: IDropdownOption) => ({
      id: cat.value,
      name: cat.label,
      count: events.filter((e: IEvent) => e.category === cat.value).length,
    })),
  ];

  const registeredEvents = events.filter((event: IEvent) => event.attendees.some((attendee: IAttendee) => attendee.user === user.id));
  const myEvents = events.filter((event: IEvent) => (event.organizer as unknown as IUser).id === user.id);

  const getEventStatus = (eventStartDate: Date, eventEndDate: Date) => {
    const now = new Date();
    if (now < eventStartDate) return "upcoming";
    if (now > eventEndDate) return "completed";

    console.log(now, eventStartDate, eventEndDate);
    return "ongoing";
  };

  const canEditEvent = (event: { startDate: Date; status?: string } | { date: string; status?: string }) => {
    const dateToCheck = 'startDate' in event ? event.startDate : new Date(event.date);
    const now = new Date().getTime();
    const start = new Date(dateToCheck).getTime();
    const diff = start - now;
    return diff > 24 * 60 * 60 * 1000;
  };

  const openEditEvent = (event: IEvent) => {
    setEditingEvent({
      id: event.id!,
      title: event.title,
      description: event.description,
      date: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      location: event.location?.name || event.onlineDetails?.meetingLink || '',
      type: event.type,
      category: event.category,
      maxAttendees: String(event.capacity || ''),
      tags: event.tags?.join(',') || '',
    })
    setEditDialogOpen(true)
  }

  const saveEditEvent = async () => {
    if (!editingEvent) return
    try {
      const res = await updateEvent(editingEvent.id!, {
        title: editingEvent.title,
        description: editingEvent.description,
        startDate: new Date(editingEvent.date),
        endDate: new Date(editingEvent.endDate),
        location: { name: editingEvent.location },
        capacity: Number(editingEvent.maxAttendees),
        type: editingEvent.type as 'online' | 'offline' | 'hybrid',
        category: editingEvent.category as 'workshop' | 'seminar' | 'meeting' | 'training' | 'conference' | 'social' | 'team-building' | 'presentation' | 'webinar' | 'other',
        tags: editingEvent.tags.split(',').map(tag => tag.trim()),
      })
      const updated: IEvent = res.data.event
      setEvents((prev) =>
        prev.map((e: IEvent) =>
          e._id === updated._id ? { ...e, ...updated } : e
        )
      );
      setEditDialogOpen(false)
      setEditingEvent(null)
    } catch (e: unknown) {
      console.error("Failed to save event:", e);
    }
  }

  const openAttendees = async (event: IEvent) => {
    try {
      const res = await getEventAttendees(event._id!)
      setAttendees(res.data.attendees || [])
      setAttendeesDialogOpen(true)
    } catch (e: unknown) {
      console.error("Failed to fetch attendees:", e);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-muted-foreground">
            Discover and join company events and activities
          </p>
        </div>

        {isAdmin && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Event Title</label>
                    <Input
                      placeholder="Enter event title"
                      value={newEvent.title}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, title: e.target.value });
                        setNewEventErrors((prev) => { delete prev.title; delete prev.apiError; return { ...prev }; });
                      }}
                      className={newEventErrors.title ? "border-red-500" : ""}
                    />
                    {newEventErrors.title && (
                      <p className="text-red-500 text-xs mt-1">{newEventErrors.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="Conference Room A / Virtual"
                      value={newEvent.location}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, location: e.target.value });
                        setNewEventErrors((prev) => { delete prev.location; delete prev.apiError; return { ...prev }; });
                      }}
                      className={newEventErrors.location ? "border-red-500" : ""}
                    />
                    {newEventErrors.location && (
                      <p className="text-red-500 text-xs mt-1">{newEventErrors.location}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value) => {
                        setNewEvent({ ...newEvent, type: value });
                        setNewEventErrors((prev) => { delete prev.type; delete prev.apiError; return { ...prev }; });
                      }}
                    >
                      <SelectTrigger className={newEventErrors.type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type: IDropdownOption) => (
                          <SelectItem key={type._id} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newEventErrors.type && (
                      <p className="text-red-500 text-xs mt-1">{newEventErrors.type}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) => {
                        setNewEvent({ ...newEvent, category: value });
                        setNewEventErrors((prev) => { delete prev.category; delete prev.apiError; return { ...prev }; });
                      }}
                    >
                      <SelectTrigger className={newEventErrors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategories.map((category: IDropdownOption) => (
                          <SelectItem key={category._id} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newEventErrors.category && (
                      <p className="text-red-500 text-xs mt-1">{newEventErrors.category}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Attendees</label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={newEvent.maxAttendees}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          maxAttendees: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Start Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, date: e.target.value });
                        setNewEventErrors((prev) => { delete prev.date; delete prev.apiError; return { ...prev }; });
                      }}
                      className={newEventErrors.date ? "border-red-500" : ""}
                    />
                    {newEventErrors.date && (
                      <p className="text-red-500 text-xs mt-1">{newEventErrors.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      End Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, endDate: e.target.value });
                        setNewEventErrors((prev) => { delete prev.endDate; delete prev.apiError; return { ...prev }; });
                      }}
                      className={newEventErrors.endDate ? "border-red-500" : ""}
                    />
                    {newEventErrors.endDate && (
                      <p className="text-red-500 text-xs mt-1">{newEventErrors.endDate}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe your event, what attendees will learn or experience..."
                    rows={4}
                    value={newEvent.description}
                    onChange={(e) => {
                      setNewEvent({ ...newEvent, description: e.target.value });
                      setNewEventErrors((prev) => { delete prev.description; delete prev.apiError; return { ...prev }; });
                    }}
                    className={newEventErrors.description ? "border-red-500" : ""}
                  />
                  {newEventErrors.description && (
                    <p className="text-red-500 text-xs mt-1">{newEventErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Tags (comma-separated)
                  </label>
                  <Input
                    placeholder="e.g., AI, Workshop, Hands-on"
                    value={newEvent.tags}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, tags: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2 pt-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Attachments</label>
                    <Input type="file" multiple onChange={(e) => setEventFiles(e.target.files ? Array.from(e.target.files) : [])} />
                  </div>
                  <Button onClick={handleCreateEvent} className="flex-1"
                    disabled={
                      !newEvent.title ||
                      !newEvent.description ||
                      !newEvent.date ||
                      !newEvent.location ||
                      !newEvent.type ||
                      !newEvent.category ||
                      Object.keys(newEventErrors).length > 0
                    }
                  >
                    Create Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
                {newEventErrors.apiError && (
                  <p className="text-red-500 text-xs mt-1 text-center">{newEventErrors.apiError}</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList
          className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="registered">My Registrations</TabsTrigger>
          {isAdmin && <TabsTrigger value="my-events">My Events</TabsTrigger>}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category: IEventCategory) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option: IDropdownOption) => (
                  <SelectItem key={option._id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedEvents.map((event: IEvent) => (
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getEventTypeIcon(event.type)}
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <Badge
                        className={`text-xs ${getStatusColor(getEventStatus(new Date(event.startDate), new Date(event.endDate)))}`}
                      >
                        {getEventStatus(new Date(event.startDate), new Date(event.endDate))}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.attendees.length}/{event.capacity} attending
                    </div>
                  </div>
                  <CardTitle className="text-lg text-balance">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground text-pretty line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      <span>{formatEventDate(new Date(event.startDate))}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location?.name || event.onlineDetails?.meetingLink}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {event.tags
                      ?.slice(0, 3)
                      .map(
                        (
                          tag: string,
                          index: Key | null | undefined
                        ) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        )
                      )}
                    {event.tags?.length && event.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{event.tags?.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage
                          src={(event.organizer as unknown as IUser).avatar || "/placeholder.svg"}
                          alt={(event.organizer as unknown as IUser).name}
                        />
                        <AvatarFallback className="text-xs">
                          {(event.organizer as unknown as IUser).name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">
                          {(event.organizer as unknown as IUser).name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(event.organizer as unknown as IUser).department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {Array.isArray(event.images) && event.images.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {event.images.length} image{event.images.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <Share className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={event.attendees.some((attendee: IAttendee) => attendee.user === user.id)
                          ? "outline"
                          : "default"
                        }
                        size="sm"
                        onClick={() => handleRegister(event.id!)}
                        disabled={
                          (event.attendees.some((attendee: IAttendee) => attendee.user === user.id) && getEventStatus(new Date(event.startDate), new Date(event.endDate)) === "completed") ||
                          event.status === "cancelled"
                        }
                      >
                        {event.attendees.some((attendee: IAttendee) => attendee.user === user.id)
                          ? "Registered"
                          : "RSVP"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registered" className="space-y-6">
          {registeredEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No registered events
                </h3>
                <p className="text-muted-foreground mb-4">
                  Register for events to see them here
                </p>
                <Button onClick={() => setActiveTab("all")}>
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {registeredEvents.map((event: IEvent) => (
                <Card
                  key={event._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getEventTypeIcon(event.type)}
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                        <Badge
                          className={`text-xs ${getStatusColor(getEventStatus(new Date(event.startDate), new Date(event.endDate)))}`}
                        >
                          {getEventStatus(new Date(event.startDate), new Date(event.endDate))}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.attendees.length}/{event.capacity} attending
                      </div>
                    </div>
                    <CardTitle className="text-lg text-balance">
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        <span>{formatEventDate(new Date(event.startDate))}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location?.name || event.onlineDetails?.meetingLink}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="my-events" className="space-y-6">
            {myEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No events created
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {isAdmin
                      ? "Create your first event to get started"
                      : "Only admin users can create events"}
                  </p>
                  {isAdmin && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {myEvents.map((event: IEvent) => (
                  <Card
                    key={event._id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(event.type)}
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                          <Badge
                            className={`text-xs ${getStatusColor(
                              getEventStatus(new Date(event.startDate), new Date(event.endDate))
                            )}`}
                          >
                            {getEventStatus(new Date(event.startDate), new Date(event.endDate))}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.attendees.length}/{event.capacity} attending
                        </div>
                      </div>
                      <CardTitle className="text-lg text-balance">
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <CalendarDays className="w-4 h-4" />
                          <span>{formatEventDate(new Date(event.startDate))}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location?.name || event.onlineDetails?.meetingLink}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          disabled={!canEditEvent(event)}
                          onClick={() => openEditEvent(event)}
                        >
                          Edit Event
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => openAttendees(event)}
                        >
                          View Attendees
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

    {/* Edit Event Dialog */}
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        {editingEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Event Title</label>
                <Input value={editingEvent.title} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input value={editingEvent.location} onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Start</label>
                <Input type="datetime-local" value={editingEvent.date} onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">End</label>
                <Input type="datetime-local" value={editingEvent.endDate} onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Max Attendees</label>
                <Input type="number" value={editingEvent.maxAttendees} onChange={(e) => setEditingEvent({ ...editingEvent, maxAttendees: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea rows={4} value={editingEvent.description} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveEditEvent} disabled={!canEditEvent(editingEvent)}>Save</Button>
            </div>
            {!canEditEvent(editingEvent) && (
              <p className="text-xs text-red-600">Event cannot be edited within 24 hours of start time.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Attendees Dialog */}
    <Dialog open={attendeesDialogOpen} onOpenChange={setAttendeesDialogOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Attendees</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {attendees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendees yet.</p>
          ) : attendees.map((a: IAttendee) => (
            <div key={a._id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={a.avatar || '/placeholder.svg'} />
                  <AvatarFallback className="text-xs">{a.name?.split(' ').map((x:string)=>x[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.email}</div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{a.status}</Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}
