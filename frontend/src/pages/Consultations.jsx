import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Consultations = () => {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [replyModal, setReplyModal] = useState({ show: false, consultationId: null });
    const [replyText, setReplyText] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchConsultations();
    }, []);

    const fetchConsultations = async () => {
        try {
            const response = await api.get('/consultations');
            setConsultations(response.data);
        } catch (error) {
            console.error('Failed to fetch consultations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/consultations', {
                subject: newSubject,
                description: newDescription
            });
            setShowModal(false);
            setNewSubject('');
            setNewDescription('');
            fetchConsultations();
        } catch (error) {
            console.error('Failed to create consultation', error);
        }
    };

    const handleAssign = async (id) => {
        try {
            await api.patch(`/consultations/${id}/assign`);
            fetchConsultations();
        } catch (error) {
            console.error('Failed to assign consultation', error);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/consultations/${replyModal.consultationId}/reply`, {
                expert_response: replyText
            });
            setReplyModal({ show: false, consultationId: null });
            setReplyText('');
            fetchConsultations();
        } catch (error) {
            console.error('Failed to reply to consultation', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
                {user?.role === 'user' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={20} />
                        New Consultation
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="grid gap-4">
                    {consultations.map((consultation) => (
                        <div key={consultation.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{consultation.subject}</h3>
                                    <p className="text-sm text-slate-500">Created on {new Date(consultation.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                                    {consultation.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <p className="text-slate-600 mb-4">{consultation.description}</p>

                            {consultation.expert_response && (
                                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-4">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-600" />
                                        Expert Response
                                    </h4>
                                    <p className="text-slate-700">{consultation.expert_response}</p>
                                </div>
                            )}

                            {user?.role === 'expert' && consultation.status === 'open' && (
                                <button
                                    onClick={() => handleAssign(consultation.id)}
                                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Assign to me
                                </button>
                            )}

                            {user?.role === 'expert' && consultation.status === 'in_progress' && consultation.expert_id === user.id && (
                                <button
                                    onClick={() => setReplyModal({ show: true, consultationId: consultation.id })}
                                    className="mt-4 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    <MessageSquare size={16} />
                                    Reply
                                </button>
                            )}
                        </div>
                    ))}
                    {consultations.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            No consultations found.
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Request Consultation</h2>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {replyModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Reply to Consultation</h2>
                        <form onSubmit={handleReply}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Response</label>
                                    <textarea
                                        required
                                        rows="6"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write your expert legal advice here..."
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReplyModal({ show: false, consultationId: null })}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Submit Response
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Consultations;
