import React, { useState, useEffect } from 'react';
import Calendar from '../components/Calendar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ExpertAvailability = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await api.get(`/availability/${user.id}/availability`);
                const formattedEvents = response.data.map(slot => ({
                    id: slot.id,
                    title: 'Available',
                    start: new Date(`${new Date().toISOString().split('T')[0]}T${slot.start_time}`), // Simplified for demo
                    end: new Date(`${new Date().toISOString().split('T')[0]}T${slot.end_time}`),
                }));
                setEvents(formattedEvents);
            } catch (error) {
                console.error("Error fetching availability", error);
            }
        };
        if (user) {
            fetchAvailability();
        }
    }, [user]);

    const handleSelectSlot = async ({ start, end }) => {
        const startTime = start.toTimeString().split(' ')[0].substring(0, 5);
        const endTime = end.toTimeString().split(' ')[0].substring(0, 5);

        try {
            await api.post('/availability/me/availability', {
                start_time: startTime,
                end_time: endTime,
                is_recurring: true,
                day_of_week: start.getDay().toString()
            });
            // Refresh events
            setEvents([...events, { start, end, title: 'Available' }]);
        } catch (error) {
            console.error("Error setting availability", error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Availability</h1>
            <Calendar events={events} onSelectSlot={handleSelectSlot} selectable={true} />
        </div>
    );
};

export default ExpertAvailability;
