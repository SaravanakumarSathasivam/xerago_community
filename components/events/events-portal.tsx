"use client";

import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
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
  toggleRsvp,
} from "@/lib/api";
import { useDropdownOptions } from "@/hooks/use-dropdown-options";

// start with empty; populate via API
const mockEvents: any[] = [];

interface EventsPortalProps {
  user: any;
}

export function EventsPortal({ user }: EventsPortalProps) {
  const [events, setEvents] = useState<any[]>(mockEvents);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [newEvent, setNewEvent] = useState({
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

  // Fetch dropdown options from API
  const { options: eventTypes, loading: eventTypesLoading } = useDropdownOptions('event_type');
  const { options: eventCategories, loading: eventCategoriesLoading } = useDropdownOptions('event_category');
  const { options: sortOptions, loading: sortOptionsLoading } = useDropdownOptions('event_sort');

  useEffect(() => {
    (async () => {
      try {
        const res = await getEvents();
        setEvents(res.data.events || []);
      } catch (e) {
        // swallow for now; UI stays empty
      }
    })();
  }, []);

  const isAdmin = user.email === "samuel@xerago.com";

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "registered" && event.isRegistered) ||
      (activeTab === "my-events" && event.organizer.name === user.name);

    return matchesCategory && matchesSearch && matchesTab;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "popular") {
      return b.attendees - a.attendees;
    }
    return 0;
  });

  const handleRegister = async (eventId: string) => {
    try {
      const res = await toggleRsvp(eventId);
      const updated = res.data.event;
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch {}
  };

  const handleCreateEvent = async () => {
    if (
      !newEvent.title ||
      !newEvent.description ||
      !newEvent.date ||
      !newEvent.location
    )
      return;

    const payload = {
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      endDate: newEvent.endDate || newEvent.date,
      location: newEvent.location,
      type: newEvent.type,
      category: newEvent.category,
      maxAttendees: newEvent.maxAttendees,
      tags: newEvent.tags,
    };

    try {
      const res = await apiCreateEvent(payload);
      const created = res.data.event;
      setEvents((prev) => [created, ...prev]);
    } catch {}

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
    setIsCreateDialogOpen(false);
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
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

  const categories = [
    { id: "all", name: "All Categories", count: events.length },
    ...eventCategories.map((cat) => ({
      id: cat.value,
      name: cat.label,
      count: events.filter((e) => e.category === cat.value).length,
    })),
  ];

  const registeredEvents = events.filter((event) => event.isRegistered);
  const myEvents = events.filter((event) => event.organizer.name === user.name);

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    return eventDateTime > now ? "upcoming" : "completed";
  };

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
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="Conference Room A / Virtual"
                      value={newEvent.location}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, location: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value) =>
                        setNewEvent({ ...newEvent, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type._id} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) =>
                        setNewEvent({ ...newEvent, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategories.map((category) => (
                          <SelectItem key={category._id} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      End Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe your event, what attendees will learn or experience..."
                    rows={4}
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                  />
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

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateEvent} className="flex-1">
                    Create Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
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
            {categories.map((category) => (
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
                {sortOptions.map((option) => (
                  <SelectItem key={option._id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedEvents.map((event) => (
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
                        className={`text-xs ${getStatusColor(event.status)}`}
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.attendees}/{event.maxAttendees} attending
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
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {event.tags
                      .slice(0, 3)
                      .map(
                        (
                          tag:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<AwaitedReactNode>
                            | null
                            | undefined,
                          index: Key | null | undefined
                        ) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        )
                      )}
                    {event.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{event.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage
                          src={event.organizer.avatar || "/placeholder.svg"}
                          alt={event.organizer.name}
                        />
                        <AvatarFallback className="text-xs">
                          {event.organizer.name
                            .split(" ")
                            .map((n: any[]) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">
                          {event.organizer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.organizer.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <Share className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={event.isRegistered ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleRegister(event.id)}
                        disabled={
                          event.status === "completed" ||
                          (!event.isRegistered &&
                            event.attendees >= event.maxAttendees)
                        }
                      >
                        {event.isRegistered ? "Registered" : "Register"}
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
              {registeredEvents.map((event) => (
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
                          className={`text-xs ${
                            getEventStatus(event.date) === "upcoming"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {getEventStatus(event.date)}
                        </Badge>
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
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
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
                {myEvents.map((event) => (
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
                            className={`text-xs ${getStatusColor(
                              event.status
                            )}`}
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.attendees}/{event.maxAttendees} attending
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
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                        >
                          Edit Event
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
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
    </div>
  );
}
