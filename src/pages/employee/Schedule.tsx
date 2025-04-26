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
import { format, addDays, parseISO, isToday, isBefore, isAfter, differenceInDays, startOfWeek, addWeeks, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { api } from "@/services/api";

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

  // Sample fallback schedule data in case API fails or returns empty data
  const mockScheduleData: ScheduleEvent[] = [
    {
      _id: "mock1",
      title: "Morning Shift",
      description: "Regular morning fuel station shift",
      startDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      startTime: "08:00",
      endTime: "16:00",
      location: "Main Station, Pump 1-3",
      isAllDay: false,
      type: "shift",
      status: "scheduled"
    },
    {
      _id: "mock2",
      title: "Staff Meeting",
      description: "Monthly staff coordination meeting",
      startDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      startTime: "14:00",
      endTime: "15:30",
      location: "Conference Room",
      isAllDay: false,
      type: "meeting",
      status: "scheduled"
    },
    {
      _id: "mock3",
      title: "Evening Shift",
      description: "Evening shift at convenience store",
      startDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
      startTime: "16:00",
      endTime: "00:00",
      location: "Convenience Store",
      isAllDay: false,
      type: "shift",
      status: "scheduled"
    }
  ];

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });

      console.log('[DEBUG][Schedule] Fetching schedule for date range:', {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        selectedDate: format(selectedDate, 'yyyy-MM-dd')
      });

      const response = await api.employee.getSchedule(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );
      
      console.log('[DEBUG][Schedule] API response:', response);

      if (response && response.data) {
        // Transform the backend schedule data to match frontend format
        const scheduleData: ScheduleEvent[] = response.data.flatMap((schedule: any) => {
          console.log('[DEBUG][Schedule] Processing schedule:', schedule);
          return schedule.shifts.map((shift: any) => {
            // Convert day name to date
            const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(shift.day);
            const shiftDate = addDays(schedule.weekStartDate, dayIndex);
            
            return {
              _id: `${schedule._id}-${shift.day}`,
              title: shift.isOffDay ? 'Day Off' : 'Work Shift',
              description: shift.notes,
              startDate: format(shiftDate, 'yyyy-MM-dd'),
              endDate: format(shiftDate, 'yyyy-MM-dd'),
              startTime: shift.startTime,
              endTime: shift.endTime,
              location: 'Main Office',
              department: schedule.department,
              isAllDay: false,
              type: 'shift',
              status: schedule.status,
              employees: [schedule.employeeId]
            };
          });
        });

        console.log('[DEBUG][Schedule] Transformed schedule data:', scheduleData);
        setScheduleEvents(scheduleData);
      } else {
        console.warn('[Schedule] No schedule data received from API');
        setScheduleEvents([]);
      }
    } catch (error) {
      console.error('[Schedule] Error fetching schedule:', error);
      toast.error('Failed to fetch schedule data');
      setScheduleEvents([]);
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
      if (!event.startDate || !event.endDate) return false;
      
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
      if (!event.startDate || !event.endDate) return false;
      
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
        return "bg-blue-600 text-white border-blue-700";
      case 'meeting':
        return "bg-purple-600 text-white border-purple-700";
      case 'training':
        return "bg-green-600 text-white border-green-700";
      case 'holiday':
        return "bg-red-600 text-white border-red-700";
      case 'event':
        return "bg-amber-600 text-white border-amber-700";
      default:
        return "bg-gray-600 text-white border-gray-700";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return "bg-blue-600 text-white border-blue-700";
      case 'completed':
        return "bg-green-600 text-white border-green-700";
      case 'cancelled':
        return "bg-red-600 text-white border-red-700";
      default:
        return "bg-gray-600 text-white border-gray-700";
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
        if (!event.startDate) return false;
        
        const eventStart = parseISO(event.startDate);
        return (
          (isAfter(eventStart, today) || isSameDay(eventStart, today)) && 
          (isBefore(eventStart, next7Days) || isSameDay(eventStart, next7Days))
        );
      })
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
  };

  // Get next event
  const getNextEvent = (): ScheduleEvent | null => {
    const today = new Date();
    
    const upcomingEvents = scheduleEvents
      .filter(event => {
        if (!event.startDate) return false;
        
        const eventStart = parseISO(event.startDate);
        return isAfter(eventStart, today) || isSameDay(eventStart, today);
      })
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
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
    if (!startDate || !endDate) return "Invalid date range";
    
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
        <Card className="bg-blue-800 border-grey-200">
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
                    <Card key={event._id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium">{event.title}</h3>
                              <div className="flex gap-2">
                                <Badge variant="outline" className={getEventBadgeColor(event.type)}>
                                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                </Badge>
                                <Badge variant="outline" className={getStatusBadgeColor(event.status)}>
                                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{formatEventTime(event)}</span>
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              
                              {event.description && (
                                <div className="mt-1">
                                  <span className="text-sm">{event.description}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button variant="outline" size="sm" onClick={() => handleViewEvent(event)}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
                          <div className="text-sm font-medium">{format(day, 'EEEE')}</div>
                          <div className="text-sm text-muted-foreground">{format(day, 'MMMM d')}</div>
                        </TableCell>
                        <TableCell>
                          {dayEvents.length > 0 ? (
                            <div className="space-y-2">
                              {dayEvents.map((event) => (
                                <Card key={event._id} className="hover:bg-muted/50 transition-colors">
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">{event.title}</span>
                                          <Badge variant="outline" className={getEventBadgeColor(event.type)}>
                                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                          <Clock className="h-3 w-3 mr-1" />
                                          <span>{formatEventTime(event)}</span>
                                        </div>
                                      </div>
                                      <Button size="sm" variant="ghost" onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewEvent(event);
                                      }}>
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No events</div>
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
        <Card className="mt-6 border-grey-200 rounded-md">
          <CardHeader className="bg-blue-800">
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