import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Calendar, ArrowRight, Loader2, Users, Clock, MapPin, Info, CheckCircle, CalendarDays } from "lucide-react";
import axios from "axios";
import { format, addDays, parseISO, isToday, isBefore, isAfter, differenceInDays, startOfWeek, addWeeks, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  department?: string;
  isAllDay: boolean;
  type: 'shift' | 'meeting' | 'training' | 'holiday' | 'event';
  status: 'scheduled' | 'completed' | 'cancelled';
  employees?: string[];
}

export default function EmployeeSchedule() {
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState("week");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  
  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      
      // Get authentication token and email from localStorage
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      
      console.log('[DEBUG][Schedule] Fetching schedule data with token:', token ? 'Present' : 'Missing');
      console.log('[DEBUG][Schedule] User email from localStorage:', email);
      
      if (!token) {
        console.log('[DEBUG][Schedule] Authentication token missing');
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      if (!email) {
        console.log('[DEBUG][Schedule] User email missing');
        toast.error('User information missing. Please log in again.');
        return;
      }
      
      // Use start and end date for the current month to get a wide range of events
      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(addMonths(new Date(), 2)); // Get 3 months of schedule
      
      console.log(`[DEBUG][Schedule] Fetching schedule from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
      
      // Use the API service instead of direct axios call
      const response = await axios.post('/api/employee/getSchedule', {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('[DEBUG][Schedule] API response:', JSON.stringify(response));
      
      if (response.data.success) {
        // Handle different possible response formats
        let events: ScheduleEvent[] = [];
        
        if (Array.isArray(response.data.data)) {
          console.log('[DEBUG][Schedule] Response data is an array');
          events = response.data.data;
        } else if (response.data.data?.schedules && Array.isArray(response.data.data.schedules)) {
          console.log('[DEBUG][Schedule] Response data contains schedules array');
          events = response.data.data.schedules;
        } else if (typeof response.data.data === 'object') {
          console.log('[DEBUG][Schedule] Response data is an object, looking for schedule data');
          // Try to find an array in the response
          for (const key in response.data.data) {
            if (Array.isArray(response.data.data[key])) {
              console.log(`[DEBUG][Schedule] Found array in response.data.${key}`);
              events = response.data.data[key];
              break;
            }
          }
        }
        
        console.log(`[DEBUG][Schedule] Retrieved ${events.length} schedule events`);
        
        if (events.length === 0) {
          console.log('[DEBUG][Schedule] No events found in response');
          toast.info('No scheduled events found for this period');
        }
        
        setScheduleEvents(events);
      } else {
        console.log('[DEBUG][Schedule] Failed to fetch schedule data:', response.data.error);
        toast.error(`Failed to load schedule data: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[DEBUG][Schedule] Error fetching schedule data:', error);
      if (error.response && error.response.status === 401) {
        console.log('[DEBUG][Schedule] 401 Unauthorized error');
        toast.error('Session expired. Please log in again.');
      } else {
        console.log('[DEBUG][Schedule] Other API error:', error.message);
        toast.error(`Failed to load schedule data: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to add months to date
  function addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  // Filter events for the selected date
  const getEventsForDate = (date: Date): ScheduleEvent[] => {
    return scheduleEvents.filter(event => {
      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);
      
      return (isAfter(date, eventStart) || isSameDay(date, eventStart)) && 
             (isBefore(date, eventEnd) || isSameDay(date, eventEnd));
    });
  };
  
  // Filter events for the selected week
  const getEventsForWeek = (): ScheduleEvent[] => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    
    return scheduleEvents.filter(event => {
      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);
      
      return (
        (isAfter(eventStart, weekStart) || isSameDay(eventStart, weekStart)) && 
        (isBefore(eventStart, weekEnd) || isSameDay(eventStart, weekEnd))
      ) || (
        (isAfter(eventEnd, weekStart) || isSameDay(eventEnd, weekStart)) && 
        (isBefore(eventEnd, weekEnd) || isSameDay(eventEnd, weekEnd))
      );
    });
  };

  // Get days for week view
  const getWeekDays = (): Date[] => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  // Format event time
  const formatEventTime = (event: ScheduleEvent): string => {
    if (event.isAllDay) {
      return "All Day";
    }
    return `${event.startTime} - ${event.endTime}`;
  };

  // Get badge color based on event type
  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'shift':
        return "bg-blue-100 text-blue-800 border-blue-300";
      case 'meeting':
        return "bg-purple-100 text-purple-800 border-purple-300";
      case 'training':
        return "bg-green-100 text-green-800 border-green-300";
      case 'holiday':
        return "bg-red-100 text-red-800 border-red-300";
      case 'event':
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return "bg-blue-100 text-blue-800 border-blue-300";
      case 'completed':
        return "bg-green-100 text-green-800 border-green-300";
      case 'cancelled':
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Check if date has events
  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  // Handle day click
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setViewType("day");
  };

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = (): ScheduleEvent[] => {
    const today = new Date();
    const next7Days = addDays(today, 7);
    
    return scheduleEvents
      .filter(event => {
        const eventStart = parseISO(event.startDate);
        return (
          (isAfter(eventStart, today) || isSameDay(eventStart, today)) && 
          (isBefore(eventStart, next7Days) || isSameDay(eventStart, next7Days))
        );
      })
      .sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
  };

  // Get next event
  const getNextEvent = (): ScheduleEvent | null => {
    const today = new Date();
    
    const upcomingEvents = scheduleEvents
      .filter(event => {
        const eventStart = parseISO(event.startDate);
        return isAfter(eventStart, today) || isSameDay(eventStart, today);
      })
      .sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
    
    return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  };

  // Handler for "View Event" button
  const handleViewEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event);
  };

  // Close event details view
  const closeEventDetails = () => {
    setSelectedEvent(null);
  };
  
  // Format date range display
  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (isSameDay(start, end)) {
      return format(start, 'MMMM d, yyyy');
    }
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
    }
    
    return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
  };

  const nextEvent = getNextEvent();
  const upcomingEvents = getUpcomingEvents();
  const weekDays = getWeekDays();
  const eventsForDate = getEventsForDate(selectedDate);
  const eventsForWeek = getEventsForWeek();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-muted-foreground">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">My Schedule</h1>
        <Button onClick={fetchScheduleData} variant="outline">
          Refresh Schedule
        </Button>
      </div>

      {/* Next Event Card */}
      {nextEvent && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Next Scheduled Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold">{nextEvent.title}</h3>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm text-muted-foreground">
                    {formatDateRange(nextEvent.startDate, nextEvent.endDate)}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm text-muted-foreground">{formatEventTime(nextEvent)}</span>
                </div>
                {nextEvent.location && (
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm text-muted-foreground">{nextEvent.location}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 md:mt-0">
                <Button size="sm" onClick={() => handleViewEvent(nextEvent)}>
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-12">
        {/* Calendar Card */}
        <Card className="col-span-12 md:col-span-8">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && handleDateSelect(date)}
              className="rounded-md border"
              modifiers={{
                event: (date) => hasEvents(date),
                today: (date) => isToday(date)
              }}
              modifiersClassNames={{
                event: "bg-blue-50 font-medium text-blue-900",
                today: "bg-green-50 font-bold text-green-900"
              }}
            />
          </CardContent>
        </Card>

        {/* Upcoming Events Card */}
        <Card className="col-span-12 md:col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event._id} className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEvent(event)}>
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{event.title}</div>
                      <Badge className={getEventBadgeColor(event.type)}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-2">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(parseISO(event.startDate), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{formatEventTime(event)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No upcoming events in the next 7 days
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule View */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                {viewType === "day" 
                  ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                  : `Week of ${format(weekDays[0], 'MMMM d')} - ${format(weekDays[6], 'MMMM d, yyyy')}`
                }
              </CardDescription>
            </div>
            <div className="mt-2 md:mt-0">
              <Tabs value={viewType} onValueChange={setViewType}>
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewType === "day" ? (
            // Day View
            <div>
              {eventsForDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForDate.map((event) => (
                    <div key={event._id} className="border rounded-md p-4 hover:bg-muted/50">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold">{event.title}</h3>
                            <Badge className={getEventBadgeColor(event.type)}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </Badge>
                            <Badge className={getStatusBadgeColor(event.status)}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{formatEventTime(event)}</span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{event.location}</span>
                            </div>
                          )}
                          
                          {event.description && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {event.description}
                            </div>
                          )}
                        </div>
                        
                        <Button className="mt-4 md:mt-0" size="sm" onClick={() => handleViewEvent(event)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No events scheduled for this day
                </div>
              )}
            </div>
          ) : (
            // Week View
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Events</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weekDays.map((day, index) => {
                    const dayEvents = getEventsForDate(day);
                    
                    return (
                      <TableRow key={index} className={isToday(day) ? "bg-green-50" : ""}>
                        <TableCell className="font-medium">
                          <div className="font-bold">{format(day, 'EEEE')}</div>
                          <div className="text-sm text-muted-foreground">{format(day, 'MMMM d')}</div>
                        </TableCell>
                        <TableCell>
                          {dayEvents.length > 0 ? (
                            <div className="space-y-2">
                              {dayEvents.map((event) => (
                                <div key={event._id} className="border rounded-md p-2 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => handleViewEvent(event)}>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{event.title}</span>
                                      <Badge className={getEventBadgeColor(event.type)}>
                                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">{formatEventTime(event)}</span>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost" onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewEvent(event);
                                  }}>
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-muted-foreground">No events</div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Card (conditionally rendered) */}
      {selectedEvent && (
        <Card className="mt-6 border-blue-200">
          <CardHeader className="bg-blue-50">
            <div className="flex justify-between">
              <CardTitle>{selectedEvent.title}</CardTitle>
              <Button variant="ghost" size="sm" onClick={closeEventDetails}>
                Close
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={getEventBadgeColor(selectedEvent.type)}>
                {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
              </Badge>
              <Badge className={getStatusBadgeColor(selectedEvent.status)}>
                {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Date & Time</h3>
                <div className="flex items-center mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  <span>{formatDateRange(selectedEvent.startDate, selectedEvent.endDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  <span>{formatEventTime(selectedEvent)}</span>
                </div>
              </div>
              
              {selectedEvent.location && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
              )}
            </div>
            
            {selectedEvent.department && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Department</h3>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  <span>{selectedEvent.department}</span>
                </div>
              </div>
            )}
            
            {selectedEvent.description && (
              <div>
                <Separator className="my-2" />
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p>{selectedEvent.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 