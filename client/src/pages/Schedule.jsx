import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addHours, startOfDay } from "date-fns";
import enIN from "date-fns/locale/en-IN";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { motion } from 'framer-motion';

// Named motion components
const MContainer = motion.div;
const MCard = motion.div;
const MButton = motion.button;

const locales = {
  "en-IN": enIN,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom event styles based on resource type
const eventStyleGetter = (event) => {
  const backgroundColor = 
    event.resourceType === 'lab' ? '#3B82F6' :
    event.resourceType === 'room' ? '#10B981' :
    event.resourceType === 'equipment' ? '#8B5CF6' :
    event.resourceType === 'auditorium' ? '#F59E0B' : '#6B7280';

  const style = {
    backgroundColor,
    borderRadius: '8px',
    opacity: 0.9,
    color: 'white',
    border: '0px',
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
  };
  return { style };
};

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Generate realistic dummy events
  useEffect(() => {
    const today = startOfDay(new Date());
    
    const dummyEvents = [
      {
        id: 1,
        title: "AI Lab Session",
        start: addHours(today, 9),
        end: addHours(today, 11),
        resource: "Computer Lab A",
        resourceType: "lab",
        user: "Dr. Smith",
        status: "confirmed",
        description: "Machine Learning workshop for CS students"
      },
      {
        id: 2,
        title: "Team Meeting",
        start: addHours(today, 14),
        end: addHours(today, 15),
        resource: "Conference Room B",
        resourceType: "room",
        user: "John Doe",
        status: "confirmed",
        description: "Weekly team sync meeting"
      },
      {
        id: 3,
        title: "3D Printing Project",
        start: addHours(today, 11),
        end: addHours(today, 13),
        resource: "3D Printer Pro",
        resourceType: "equipment",
        user: "Sarah Wilson",
        status: "confirmed",
        description: "Prototype printing for engineering project"
      },
      {
        id: 4,
        title: "Guest Lecture",
        start: addHours(today, 10),
        end: addHours(today, 12),
        resource: "Main Auditorium",
        resourceType: "auditorium",
        user: "Prof. Johnson",
        status: "confirmed",
        description: "Industry expert talk on AI trends"
      },
      {
        id: 5,
        title: "Study Group",
        start: addHours(today, 16),
        end: addHours(today, 18),
        resource: "Silent Study Room 1",
        resourceType: "room",
        user: "Study Group A",
        status: "pending",
        description: "Group study session for finals"
      },
      {
        id: 6,
        title: "Chemistry Lab",
        start: addHours(addHours(today, 24), 13), // Tomorrow
        end: addHours(addHours(today, 24), 16),
        resource: "Chemistry Lab 3",
        resourceType: "lab",
        user: "Chemistry Dept",
        status: "confirmed",
        description: "Advanced chemistry practical session"
      },
      {
        id: 7,
        title: "Video Conference",
        start: addHours(addHours(today, 24), 10), // Tomorrow
        end: addHours(addHours(today, 24), 12),
        resource: "Conference Room B",
        resourceType: "room",
        user: "Marketing Team",
        status: "confirmed",
        description: "Client video conference call"
      }
    ];

    setEvents(dummyEvents);
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleSelectSlot = ({ start, end }) => {
    // This would open a booking modal in a real application
    alert(`Create new booking from ${format(start, 'PPp')} to ${format(end, 'PPp')}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <MContainer
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <MCard variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Resource Schedule
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            View and manage all resource bookings in real-time. Click on time slots to create new bookings.
          </p>
        </MCard>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <MCard variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              {/* Calendar Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <MButton
                    onClick={() => setDate(new Date())}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Today
                  </MButton>
                  <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                    {['month', 'week', 'day', 'agenda'].map((viewType) => (
                      <MButton
                        key={viewType}
                        onClick={() => setView(viewType)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                          view === viewType
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                      </MButton>
                    ))}
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800">
                  {format(date, 'MMMM yyyy')}
                </h2>

                <div className="flex space-x-2">
                  <MButton
                    onClick={() => setDate(addHours(date, view === 'month' ? -672 : -168))}
                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ←
                  </MButton>
                  <MButton
                    onClick={() => setDate(addHours(date, view === 'month' ? 672 : 168))}
                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    →
                  </MButton>
                </div>
              </div>

              {/* Calendar Component */}
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  views={['month', 'week', 'day', 'agenda']}
                  view={view}
                  date={date}
                  onView={setView}
                  onNavigate={setDate}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  selectable
                  style={{ 
                    height: 600,
                    fontFamily: 'inherit'
                  }}
                  eventPropGetter={eventStyleGetter}
                  messages={{
                    next: "Next",
                    previous: "Prev",
                    today: "Today",
                    month: "Month",
                    week: "Week",
                    day: "Day",
                    agenda: "Agenda",
                    date: "Date",
                    time: "Time",
                    event: "Event",
                    noEventsInRange: "No bookings in this range"
                  }}
                />
              </div>
            </MCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <MCard variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 h-full">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Booking Details</h3>
              
              {selectedEvent ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Event Information</h4>
                    <div className="space-y-2">
                      <p className="text-sm"><span className="font-medium">Title:</span> {selectedEvent.title}</p>
                      <p className="text-sm"><span className="font-medium">Resource:</span> {selectedEvent.resource}</p>
                      <p className="text-sm"><span className="font-medium">Booked by:</span> {selectedEvent.user}</p>
                      <p className="text-sm"><span className="font-medium">Time:</span> {format(selectedEvent.start, 'PPp')} - {format(selectedEvent.end, 'pp')}</p>
                      <p className="text-sm"><span className="font-medium">Duration:</span> {Math.round((selectedEvent.end - selectedEvent.start) / (1000 * 60 * 60))} hours</p>
                      <p className="text-sm"><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                          selectedEvent.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedEvent.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  {selectedEvent.description && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <MButton
                      className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit
                    </MButton>
                    <MButton
                      className="flex-1 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </MButton>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-gray-600 text-sm">
                    Click on a booking to view details
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Or click on an empty time slot to create a new booking
                  </p>
                </div>
              )}

              {/* Legend */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">Resource Types</h4>
                <div className="space-y-2">
                  {[
                    { type: 'lab', color: 'bg-blue-500', label: 'Labs' },
                    { type: 'room', color: 'bg-green-500', label: 'Rooms' },
                    { type: 'equipment', color: 'bg-purple-500', label: 'Equipment' },
                    { type: 'auditorium', color: 'bg-orange-500', label: 'Auditoriums' }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </MCard>
          </div>
        </div>
      </MContainer>
    </div>
  );
}