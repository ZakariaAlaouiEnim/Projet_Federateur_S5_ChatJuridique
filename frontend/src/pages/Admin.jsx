import { useState } from 'react';
import api from '../api/axios';
import { Upload, FileText, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';

const Admin = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    const [expertForm, setExpertForm] = useState({
        full_name: '',
        email: '',
        password: '',
        domain: 'General'
    });
    const [creatingExpert, setCreatingExpert] = useState(false);
    const [expertStatus, setExpertStatus] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setStatus(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setStatus(null);

        try {
            const response = await api.post('/admin/ingest', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setStatus({
                type: 'success',
                message: `Successfully ingested ${file.name}. Created ${response.data.chunks} chunks.`
            });
            setFile(null);
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.detail || 'Failed to upload file.'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleExpertChange = (e) => {
        setExpertForm({ ...expertForm, [e.target.name]: e.target.value });
    };

    const handleCreateExpert = async (e) => {
        e.preventDefault();
        setCreatingExpert(true);
        setExpertStatus(null);

        try {
            await api.post('/admin/experts', expertForm);
            setExpertStatus({
                type: 'success',
                message: `Expert ${expertForm.full_name} created successfully.`
            });
            setExpertForm({
                full_name: '',
                email: '',
                password: '',
                domain: 'General'
            });
        } catch (error) {
            setExpertStatus({
                type: 'error',
                message: error.response?.data?.detail || 'Failed to create expert.'
            });
        } finally {
            setCreatingExpert(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>

            {/* Ingest Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-indigo-600" />
                    Ingest Legal Documents
                </h2>
                <p className="text-slate-600 mb-6">
                    Upload PDF or Text files containing Moroccan laws. These will be indexed and used by the AI assistant.
                </p>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.txt"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                            <FileText size={32} className="text-slate-400" />
                            {file ? (
                                <span className="text-indigo-600 font-medium">{file.name}</span>
                            ) : (
                                <span className="text-slate-500">Click or drag file to upload</span>
                            )}
                        </div>
                    </div>

                    {status && (
                        <div className={`p-4 rounded-md flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {status.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {uploading ? 'Ingesting...' : 'Start Ingestion'}
                    </button>
                </form>
            </div>

            {/* Expert Creation Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <UserPlus size={20} className="text-indigo-600" />
                    Create Expert Profile
                </h2>
                <p className="text-slate-600 mb-6">
                    Create a new expert account. They will be able to manage their availability and accept appointments.
                </p>

                <form onSubmit={handleCreateExpert} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={expertForm.full_name}
                            onChange={handleExpertChange}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={expertForm.email}
                            onChange={handleExpertChange}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={expertForm.password}
                            onChange={handleExpertChange}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
                        <input
                            type="text"
                            name="domain"
                            value={expertForm.domain}
                            onChange={handleExpertChange}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {expertStatus && (
                        <div className={`p-4 rounded-md flex items-center gap-2 ${expertStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {expertStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {expertStatus.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={creatingExpert}
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {creatingExpert ? 'Creating...' : 'Create Expert'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Admin;
