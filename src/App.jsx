import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Wifi, Coffee, Volume2, VolumeX, X } from 'lucide-react';

const StudySpotter = () => {
    const [locations, setLocations] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showReservation, setShowReservation] = useState(false);
    const [libraryRooms, setLibraryRooms] = useState([
        { id: 'A101', name: 'Group Study Room A101', status: 'available', capacity: 6 },
        { id: 'A102', name: 'Group Study Room A102', status: 'busy', capacity: 8 },
        { id: 'A103', name: 'Group Study Room A103', status: 'available', capacity: 4 },
        { id: 'B201', name: 'Conference Room B201', status: 'busy', capacity: 12 },
        { id: 'B202', name: 'Study Pod B202', status: 'available', capacity: 2 },
        { id: 'C301', name: 'Collaboration Space C301', status: 'available', capacity: 10 }
    ]);

    // Study locations with their base info
    const studyLocations = [
        {
            id: 1,
            name: "Main Library - Floor 1",
            type: "Library",
            capacity: 120,
            tags: ["Quiet Zone", "Computers", "Coffee Nearby"],
            baseOccupancy: 0.4
        },
        {
            id: 2,
            name: "Main Library - Floor 2",
            type: "Library",
            capacity: 80,
            tags: ["Silent Study", "Individual Desks"],
            baseOccupancy: 0.6
        },
        {
            id: 3,
            name: "Science Library",
            type: "Library",
            capacity: 60,
            tags: ["Group Tables", "Whiteboard Access", "Coffee Nearby"],
            baseOccupancy: 0.3
        },
        {
            id: 4,
            name: "Student Union - Study Lounge",
            type: "Lounge",
            capacity: 45,
            tags: ["Casual Seating", "Group Study", "Coffee Nearby"],
            baseOccupancy: 0.5
        },
        {
            id: 5,
            name: "Engineering Computer Lab",
            type: "Computer Lab",
            capacity: 30,
            tags: ["Computers", "Printing", "Group Tables"],
            baseOccupancy: 0.7
        },
        {
            id: 6,
            name: "Business Building - Commons",
            type: "Study Space",
            capacity: 25,
            tags: ["Quiet Zone", "Individual Desks", "Natural Light"],
            baseOccupancy: 0.2
        }
    ];

    // Calculate dynamic occupancy based on time patterns
    const calculateOccupancy = (location) => {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday

        let timeMultiplier = 1;

        // Weekday vs weekend patterns
        if (day === 0 || day === 6) {
            timeMultiplier *= 0.6; // quieter on weekends
        }

        // Hourly patterns - busier during study hours
        if (hour >= 9 && hour <= 11) {
            timeMultiplier *= 1.3; // morning rush
        } else if (hour >= 14 && hour <= 17) {
            timeMultiplier *= 1.5; // afternoon peak
        } else if (hour >= 19 && hour <= 22) {
            timeMultiplier *= 1.8; // evening study time
        } else if (hour >= 23 || hour <= 7) {
            timeMultiplier *= 0.3; // very quiet late night/early morning
        }

        // Add some randomness to simulate real fluctuations
        const randomFactor = 0.8 + (Math.random() * 0.4);

        const finalOccupancy = Math.min(0.95, location.baseOccupancy * timeMultiplier * randomFactor);
        return Math.max(0.05, finalOccupancy);
    };

    // Get occupancy level and color
    const getOccupancyInfo = (occupancy) => {
        if (occupancy < 0.4) {
            return { level: 'Available', color: 'bg-green-500', textColor: 'text-green-700' };
        } else if (occupancy < 0.75) {
            return { level: 'Busy', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
        } else {
            return { level: 'Full', color: 'bg-red-500', textColor: 'text-red-700' };
        }
    };

    // Update location data with current occupancy
    const updateLocationData = () => {
        const updatedLocations = studyLocations.map(location => {
            const occupancy = calculateOccupancy(location);
            const occupied = Math.round(location.capacity * occupancy);
            const available = location.capacity - occupied;

            return {
                ...location,
                occupancy,
                occupied,
                available,
                ...getOccupancyInfo(occupancy)
            };
        });

        // Sort by availability (most available first)
        updatedLocations.sort((a, b) => b.available - a.available);

        setLocations(updatedLocations);
        setLastUpdated(new Date());
    };

    // Update data every 30 seconds to simulate real-time updates
    useEffect(() => {
        updateLocationData();
        const interval = setInterval(updateLocationData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Handle room click for reservation
    const handleRoomClick = (room) => {
        if (room.status === 'available') {
            setSelectedRoom(room);
            setShowReservation(true);
        }
    };

    // Handle reservation submission
    const handleReservation = (formData) => {
        // Here you would typically send the reservation to your backend
        console.log('Reservation submitted:', { room: selectedRoom, ...formData });
        
        // Update room status to busy
        const updatedRooms = libraryRooms.map(room => 
            room.id === selectedRoom.id 
                ? { ...room, status: 'busy' }
                : room
        );
        
        // Update the libraryRooms state
        setLibraryRooms(updatedRooms);
        
        // Close popup and reset
        setShowReservation(false);
        setSelectedRoom(null);
        
        // Show success message (you could add a toast notification here)
        alert(`Room ${selectedRoom.name} has been reserved successfully!`);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Header */}
            <div className="bg-center bg-no-repeat text-white p-4 rounded-t-lg relative overflow-hidden" 
                 style={{
                     backgroundImage: 'url(/clemson-logo.png)', 
                     backgroundColor: '#522D80',
                     backgroundSize: '200px auto'
                 }}>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <MapPin size={20} />
                            <h2 className="text-lg font-bold">Study Spotter</h2>
                        </div>
                        <div className="flex items-center gap-1 text-sm opacity-90">
                            <Clock size={14} />
                            <span>Live</span>
                        </div>
                    </div>
                    <p className="text-sm opacity-90">Find your perfect study spot</p>
                </div>
            </div>

            {/* Last updated */}
            <div className="px-4 py-2 bg-gray-50 border-b text-xs text-gray-600">
                Last updated: {lastUpdated.toLocaleTimeString()}
            </div>

            {/* Main study locations */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Users size={16} />
                    Study Locations
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    {locations.map((location) => (
                        <div key={location.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                            {/* location header */}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-medium text-gray-900 text-sm">{location.name}</h4>
                                    <p className="text-xs text-gray-500">{location.type}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${location.textColor} bg-opacity-20`}
                                      style={{backgroundColor: location.color.replace('bg-', '').replace('-500', '') === 'green' ? '#dcfce7' :
                                              location.color.replace('bg-', '').replace('-500', '') === 'yellow' ? '#fef3c7' : '#fee2e2'}}>
                  {location.level}
                </span>
                            </div>

                            {/* occupancy bar */}
                            <div className="mb-2">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>{location.available} seats available</span>
                                    <span>{location.occupied}/{location.capacity}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${location.color} transition-all duration-500`}
                                        style={{width: `${location.occupancy * 100}%`}}
                                    />
                                </div>
                            </div>

                            {/* tags */}
                            <div className="flex flex-wrap gap-1">
                                {location.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                    {tag === 'Coffee Nearby' && <Coffee size={10} />}
                                        {tag === 'Quiet Zone' && <VolumeX size={10} />}
                                        {tag === 'Computers' && <Wifi size={10} />}
                                        {tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Library rooms section */}
            <div className="px-4 pb-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 mt-4 flex items-center gap-2">
                    <MapPin size={16} />
                    Library Study Rooms
                </h3>

                <div className="grid grid-cols-2 gap-2">
                    {libraryRooms.map((room) => (
                        <div 
                            key={room.id} 
                            className={`border border-gray-200 rounded-lg p-2 text-center cursor-pointer transition-all ${
                                room.status === 'available' 
                                    ? 'hover:shadow-md hover:border-blue-300' 
                                    : 'opacity-75'
                            }`}
                            onClick={() => handleRoomClick(room)}
                        >
                            <div className="text-xs font-medium text-gray-900 mb-1">{room.name}</div>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                room.status === 'available'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                    room.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                                {room.status === 'available' ? 'Available' : 'Busy'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Seats: {room.capacity}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reservation Popup */}
            {showReservation && selectedRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Reserve Room</h3>
                            <button
                                onClick={() => setShowReservation(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900">{selectedRoom.name}</h4>
                            <p className="text-sm text-blue-700">Capacity: {selectedRoom.capacity} seats</p>
                        </div>
                        
                        <ReservationForm 
                            onSubmit={handleReservation}
                            onCancel={() => setShowReservation(false)}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>🟢 Available • 🟡 Busy • 🔴 Full</span>
                    <button
                        onClick={updateLocationData}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reservation Form Component
const ReservationForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        studentId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Set default date and time
    useEffect(() => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        const nextHour = currentHour + 1;
        
        setFormData(prev => ({
            ...prev,
            date: today,
            startTime: `${String(currentHour).padStart(2, '0')}:00`,
            endTime: `${String(nextHour).padStart(2, '0')}:00`
        }));
    }, []);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your full name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                    <input
                        type="text"
                        name="studentId"
                        required
                        value={formData.studentId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Student ID"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@clemson.edu"
                />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                    <input
                        type="time"
                        name="startTime"
                        required
                        value={formData.startTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                    <input
                        type="time"
                        name="endTime"
                        required
                        value={formData.endTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select purpose</option>
                    <option value="group-study">Group Study</option>
                    <option value="individual-study">Individual Study</option>
                    <option value="project-work">Project Work</option>
                    <option value="meeting">Meeting</option>
                    <option value="presentation">Presentation Practice</option>
                </select>
            </div>
            
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Reserve Room
                </button>
            </div>
        </form>
    );
};

export default StudySpotter;