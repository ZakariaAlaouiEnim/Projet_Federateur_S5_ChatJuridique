import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, FileText, Settings, LogOut, User, Users, Calendar, Clock } from 'lucide-react';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <span className="text-xl font-bold text-indigo-600">Jurid-AI</span>
                </div>

                <div className="flex-1 py-6 flex flex-col gap-1 px-3">
                    <Link to="/dashboard/chat" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors">
                        <MessageSquare size={20} />
                        <span className="font-medium">Chat Assistant</span>
                    </Link>
                    <Link to="/dashboard/consultations" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors">
                        <FileText size={20} />
                        <span className="font-medium">Consultations</span>
                    </Link>
                    <Link to="/dashboard/experts" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors">
                        <Users size={20} />
                        <span className="font-medium">Experts</span>
                    </Link>
                    <Link to="/dashboard/appointments" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors">
                        <Calendar size={20} />
                        <span className="font-medium">My Appointments</span>
                    </Link>
                    {user?.role === 'expert' && (
                        <Link to="/dashboard/expert/availability" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors">
                            <Clock size={20} />
                            <span className="font-medium">My Availability</span>
                        </Link>
                    )}
                    <Link to="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors">
                        <User size={20} />
                        <span className="font-medium">Profile</span>
                    </Link>
                    {user?.role === 'admin' && (
                        <Link to="/dashboard/admin" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-md transition-colors">
                            <Settings size={20} />
                            <span className="font-medium">Admin</span>
                        </Link>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                            {user?.full_name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.full_name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
