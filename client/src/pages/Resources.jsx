import { useEffect, useState } from "react";
import { motion } from 'framer-motion';

// Named motion components
const MContainer = motion.div;
const MCard = motion.div;
const MButton = motion.button;

// Dummy resources data
const dummyResources = [
  {
    _id: "1",
    name: "Computer Lab A",
    type: "lab",
    description: "Advanced computing lab with 30 high-performance computers and modern software",
    capacity: 30,
    location: "Tech Building, Room 101",
    building: "Tech Building",
    floor: "1st Floor",
    features: ["computers", "projector", "whiteboard", "wifi", "ac", "specialized-software"],
    requiresApproval: false,
    maxBookingHours: 4,
    equipment: [
      { name: "Desktop Computers", quantity: 30, isFunctional: true },
      { name: "Projector", quantity: 1, isFunctional: true }
    ]
  },
  {
    _id: "2",
    name: "Main Auditorium",
    type: "auditorium",
    description: "Large auditorium with professional sound system and projection for events",
    capacity: 200,
    location: "Central Campus, Auditorium Building",
    building: "Auditorium Building",
    floor: "Ground Floor",
    features: ["projector", "sound-system", "video-conference", "ac", "stage-lights"],
    requiresApproval: true,
    maxBookingHours: 6,
    equipment: [
      { name: "Projector", quantity: 2, isFunctional: true },
      { name: "Microphones", quantity: 4, isFunctional: true }
    ]
  },
  {
    _id: "3",
    name: "Silent Study Room 1",
    type: "room",
    description: "Quiet study room perfect for individual work and focused studying",
    capacity: 8,
    location: "Library Building, Room 305",
    building: "Library Building",
    floor: "3rd Floor",
    features: ["whiteboard", "ac", "wifi", "quiet-zone"],
    requiresApproval: false,
    maxBookingHours: 3,
    equipment: [
      { name: "Study Tables", quantity: 4, isFunctional: true },
      { name: "Whiteboard", quantity: 1, isFunctional: true }
    ]
  },
  {
    _id: "4",
    name: "3D Printer Pro",
    type: "equipment",
    description: "High-resolution 3D printer for prototyping and research projects",
    capacity: 1,
    location: "Innovation Lab, Equipment Room",
    building: "Innovation Building",
    floor: "Ground Floor",
    features: ["specialized-software", "high-precision"],
    requiresApproval: true,
    maxBookingHours: 8,
    equipment: [
      { name: "3D Printer", quantity: 1, isFunctional: true },
      { name: "Filament Rolls", quantity: 5, isFunctional: true }
    ]
  },
  {
    _id: "5",
    name: "Conference Room B",
    type: "room",
    description: "Modern conference room with video conferencing capabilities",
    capacity: 12,
    location: "Business Building, Room 205",
    building: "Business Building",
    floor: "2nd Floor",
    features: ["video-conference", "projector", "ac", "whiteboard"],
    requiresApproval: false,
    maxBookingHours: 4,
    equipment: [
      { name: "Conference Table", quantity: 1, isFunctional: true },
      { name: "Video Conference System", quantity: 1, isFunctional: true }
    ]
  },
  {
    _id: "6",
    name: "Chemistry Lab 3",
    type: "lab",
    description: "Fully equipped chemistry laboratory with safety equipment",
    capacity: 20,
    location: "Science Building, Room 150",
    building: "Science Building",
    floor: "1st Floor",
    features: ["specialized-equipment", "safety-station", "ventilation"],
    requiresApproval: true,
    maxBookingHours: 5,
    equipment: [
      { name: "Lab Benches", quantity: 10, isFunctional: true },
      { name: "Safety Equipment", quantity: 5, isFunctional: true }
    ]
  }
];

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setResources(dummyResources);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Get unique resource types for filter
  const resourceTypes = ["all", ...new Set(resources.map(r => r.type))];

  const filtered = resources.filter((r) => {
    const matchesSearch = r.name?.toLowerCase().includes(filter.toLowerCase()) ||
                         r.location?.toLowerCase().includes(filter.toLowerCase()) ||
                         r.description?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

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

  const handleBookNow = (resource) => {
    alert(`Booking ${resource.name} - This would open a booking form in a real application!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

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
            Available Resources
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover and book from our wide range of campus resources including labs, classrooms, equipment, and more.
          </p>
        </MCard>

        {/* Filters */}
        <MCard variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Resources
              </label>
              <input
                type="text"
                placeholder="Search by name, location, or description..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none"
              >
                {resourceTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-gray-600">
              Showing {filtered.length} of {resources.length} resources
            </p>
            {(filter || typeFilter !== "all") && (
              <button
                onClick={() => {
                  setFilter("");
                  setTypeFilter("all");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </MCard>

        {/* Resources Grid */}
        {filtered.length === 0 ? (
          <MCard variants={itemVariants} className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No resources found</h3>
            <p className="text-gray-600">
              {filter || typeFilter !== "all" 
                ? "Try adjusting your search filters" 
                : "No resources available at the moment"}
            </p>
          </MCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((resource) => (
              <MCard
                key={resource._id}
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Resource Type Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    resource.type === 'lab' ? 'bg-blue-100 text-blue-800' :
                    resource.type === 'room' ? 'bg-green-100 text-green-800' :
                    resource.type === 'equipment' ? 'bg-purple-100 text-purple-800' :
                    resource.type === 'auditorium' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {resource.type?.charAt(0).toUpperCase() + resource.type?.slice(1)}
                  </span>
                  {resource.requiresApproval && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      Requires Approval
                    </span>
                  )}
                </div>

                {/* Resource Name */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {resource.name}
                </h3>

                {/* Description */}
                {resource.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {resource.capacity && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">👥</span>
                      Capacity: {resource.capacity}
                    </div>
                  )}
                  {resource.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📍</span>
                      {resource.location}
                    </div>
                  )}
                  {resource.building && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">🏢</span>
                      {resource.building}
                    </div>
                  )}
                  {resource.maxBookingHours && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">⏰</span>
                      Max {resource.maxBookingHours}h
                    </div>
                  )}
                </div>

                {/* Features */}
                {resource.features && resource.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {resource.features.slice(0, 3).map((feature, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {feature.replace('-', ' ')}
                        </span>
                      ))}
                      {resource.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{resource.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <MButton
                  onClick={() => handleBookNow(resource)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Now
                </MButton>
              </MCard>
            ))}
          </div>
        )}
      </MContainer>
    </div>
  );
}