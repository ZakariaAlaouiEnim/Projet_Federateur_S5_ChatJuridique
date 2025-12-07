import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Video, Calendar, Clock } from 'lucide-react';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/appointments/me');
                setAppointments(response.data);
            } catch (error) {
                console.error("Error fetching appointments", error);
            }
        };
        fetchAppointments();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">My Appointments</h1>
            <div className="space-y-4">
                {appointments.map(apt => (
                    <div key={apt.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">Appointment</p>
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Clock size={16} />
                                    <span>{new Date(apt.start_time).toLocaleString()}</span>
                                </div>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {apt.status}
                                </span>
                            </div>
                        </div>

                        <Link
                            to={`/dashboard/room/${apt.id}`}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <Video size={18} />
                            Join Video Room
                        </Link>
                    </div>
                ))}
                {appointments.length === 0 && (
                    <p className="text-slate-500 text-center py-8">No appointments found.</p>
                )}
            </div>
        </div>
    );
};

export default MyAppointments;
