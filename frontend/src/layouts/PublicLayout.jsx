import { Outlet, Link } from 'react-router-dom';

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold text-indigo-600">Jurid-AI</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
                                Login
                            </Link>
                            <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-slate-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-slate-500 text-sm">
                        © {new Date().getFullYear()} Jurid-AI. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
