import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { User } from 'lucide-react';

const ExpertsList = () => {
    const [experts, setExperts] = useState([]);

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const response = await api.get('/experts/');
                setExperts(response.data);
            } catch (error) {
                console.error("Error fetching experts", error);
            }
        };
        fetchExperts();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Our Experts</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experts.map(expert => (
                    <div key={expert.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl mb-4">
                            {expert.full_name[0]}
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">{expert.full_name}</h2>
                        <p className="text-slate-500 mb-4">{expert.email}</p>
                        <Link
                            to={`/dashboard/book/${expert.id}`}
                            className="mt-auto bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Book Appointment
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpertsList;
