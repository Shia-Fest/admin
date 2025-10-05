import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import './App.css'
import CandidatePage from './pages/CandidatesPage';
import AddProgrammeForm from './components/AddProgrammeForm';
import ProgrammesPage from './pages/ProgrammesPage';
import ResultsPage from './pages/ResultsPage';
import PendingResultsPage from './pages/PendingResultPage';
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // This state manages which page is active
    const [activePage, setActivePage] = useState('dashboard'); 

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setActivePage('dashboard'); 
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setIsAuthenticated(false);
    };

    // This function correctly decides which page component to show
    const renderPage = () => {
        switch (activePage) {
            case 'candidates':
                return <CandidatePage />;
            case 'programmes':
                return <ProgrammesPage />;
            case 'results':
                return <ResultsPage />;
            case 'pending results':
                return <PendingResultsPage />
            case 'dashboard':
            default:
                return <DashboardPage />;
        }
    };

    // If the user is not logged in, show only the LoginPage
    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    // If logged in, show the main layout with sidebar and content
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar Navigation */}
            <aside className="w-64 p-6 bg-white shadow-md flex flex-col">
                <h1 className="text-2xl font-bold text-blue-600">Arts Fest Admin</h1>
                <nav className="mt-8">
                    <button onClick={() => setActivePage('dashboard')} className={`w-full px-4 py-2 mb-2 text-left rounded-md hover:bg-gray-200 ${activePage === 'dashboard' ? 'bg-gray-200' : ''}`}>Dashboard</button>
                    <button onClick={() => setActivePage('candidates')} className={`w-full px-4 py-2 mb-2 text-left rounded-md hover:bg-gray-200 ${activePage === 'candidates' ? 'bg-gray-200' : ''}`}>Candidates</button>
                    <button onClick={() => setActivePage('programmes')} className={`w-full px-4 py-2 mb-2 text-left rounded-md hover:bg-gray-200 ${activePage === 'programmes' ? 'bg-gray-200' : ''}`}>Programmes</button>
                    <button onClick={() => setActivePage('results')} className={`w-full px-4 py-2 mb-2 text-left rounded-md hover:bg-gray-200 ${activePage === 'results' ? 'bg-gray-200' : ''}`}>Results</button>
                    <button onClick={() => setActivePage('pending results')} className={`w-full px-4 py-2 mb-2 text-left rounded-md hover:bg-gray-200 ${activePage === 'pending results' ? 'bg-gray-200' : ''}`}>Pending Results</button>
                </nav>
                <div className="mt-auto">
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-red-600 rounded-md hover:bg-red-100">Logout</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
}

export default App;