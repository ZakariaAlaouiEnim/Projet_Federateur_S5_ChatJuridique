import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from '../components/Calendar';
import api from '../api/axios';

const BookAppointment = () => {
    const { expertId } = useParams();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await api.get(`/availability/${expertId}/availability`);
                const formattedEvents = response.data.map(slot => ({
                    id: slot.id,
                    title: 'Available',
                    start: new Date(`${new Date().toISOString().split('T')[0]}T${slot.start_time}`), // Simplified
                    end: new Date(`${new Date().toISOString().split('T')[0]}T${slot.end_time}`),
                }));
                setEvents(formattedEvents);
            } catch (error) {
                console.error("Error fetching availability", error);
            }
        };
        fetchAvailability();
    }, [expertId]);

    const handleSelectEvent = async (event) => {
        if (window.confirm("Book this slot?")) {
            try {
                await api.post('/appointments/', {
                    expert_id: expertId,
                    start_time: event.start.toISOString(),
                    end_time: event.end.toISOString()
                });
                alert("Appointment requested!");
            } catch (error) {
                console.error("Error booking appointment", error);
            }
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Book Appointment</h1>
            <Calendar events={events} onSelectEvent={handleSelectEvent} />
        </div>
    );
};

export default BookAppointment;
