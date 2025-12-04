import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-indigo-600 text-white flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                        {user?.full_name?.[0] || 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user?.full_name}</h2>
                        <p className="text-indigo-100">{user?.role === 'expert' ? 'Legal Expert' : 'Standard User'}</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 shadow-sm">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Email Address</p>
                            <p className="font-medium text-slate-900">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 shadow-sm">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Account Role</p>
                            <p className="font-medium text-slate-900 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
