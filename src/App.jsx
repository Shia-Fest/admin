import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import './App.css'
import CandidatePage from './pages/CandidatesPage';

function App() {
  const [ isAuthenticated, setIsAuthenticated ] = useState(false);
  const [ activePage, setActivePage ] = useState('dashboard');

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setIsAuthenticated(true)
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  }

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
  }

  const renderPage = () => {
    switch (activePage) {
      case 'candidate':
        return <CandidatePage />;
      default:
          return <DashboardPage />
    }
  };
  if(!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 p-6 bg-white shadow-md">
                <h1 className="text-2xl font-bold text-blue-600">Arts Fest</h1>
                <nav className="mt-8">
                    <button onClick={() => setActivePage('dashboard')} className="w-full px-4 py-2 mb-2 text-left text-gray-700 rounded-md hover:bg-gray-200">Dashboard</button>
                    <button onClick={() => setActivePage('candidates')} className="w-full px-4 py-2 mb-2 text-left text-gray-700 bg-gray-200 rounded-md">Candidates</button>
                    {/* Add more buttons here for Programmes, Results, etc. */}
                </nav>
                <div className="absolute bottom-4">
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-red-600 rounded-md hover:bg-red-100">Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
}

export default App
