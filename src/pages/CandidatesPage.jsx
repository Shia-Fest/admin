import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AddCandidateForm from '../components/AddCandidate';

const CandidatesPage = () => {
    const [teams, setTeams] = useState([]);
    const [candidates, setCandidates] = useState([]);
    
    const [selectedTeam, setSelectedTeam] = useState(null); 
    const [selectedCategory, setSelectedCategory] = useState(null)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categories = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'];

    // This effect runs once to fetch all the necessary data from the backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // We fetch both teams and candidates at the same time for efficiency
                const [teamsRes, candidatesRes] = await Promise.all([
                    api.get('/teams'),
                    api.get('/candidates')
                ]);
                setTeams(teamsRes.data);
                setCandidates(candidatesRes.data);
            } catch (err) {
                setError('Failed to fetch initial data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // This function is called by the AddCandidateForm when a new candidate is successfully created
    const handleFormSubmit = () => {
        setIsModalOpen(false);
        // We re-fetch the candidates list to show the newly added one
        api.get('/candidates').then(res => setCandidates(res.data));
    };
    
    // This function handles the deletion of a candidate
    const handleDelete = async (candidateId) => {
        if (window.confirm('Are you sure you want to delete this candidate?')) {
            try {
                await api.delete(`/candidates/${candidateId}`);
                // Re-fetch the candidates list to reflect the deletion
                api.get('/candidates').then(res => setCandidates(res.data));
            } catch (err) {
                setError('Failed to delete candidate.');
            }
        }
    };

    // A simple but powerful line: it filters the master candidate list
    // to only show candidates belonging to the currently selected team.
    const filteredCandidates = selectedTeam 
        ? candidates.filter(c => c.team?._id === selectedTeam._id && c.category === selectedCategory ) 
        : [];

    const headers = ['Image', 'Admission No', 'Name', 'Points', 'Actions'];

    // This function defines how each row in the candidate table should look
    const renderRow = (candidate) => (
        <tr key={candidate._id}>
            <td className="px-6 py-4 whitespace-nowrap"><img src={candidate.image.url} alt={candidate.name} className="w-10 h-10 rounded-full object-cover" /></td>
            <td className="px-6 py-4 text-sm text-gray-900">{candidate.admissionNo}</td>
            <td className="px-6 py-4 text-sm text-gray-900">{candidate.name}</td>
            <td className="px-6 py-4 text-sm font-bold text-gray-900">{candidate.totalPoints}</td>
            <td className="px-6 py-4 text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                <button onClick={() => handleDelete(candidate._id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    );

    const Breadcrumbs = () => (
        <div className="text-sm">
            <span onClick={() => { setSelectedTeam(null); setSelectedCategory(null);}} className="hover:underline cursor-pointer">Teams</span>
            {selectedTeam && <span className='mx-2'>&gt;</span>}
            {selectedTeam && <span onClick={() => setSelectedCategory(null)} className="hover:underline cursor-pointer">{selectedTeam.name}</span>}
            {selectedCategory && <span className="mx-2">&gt;</span>}
            {selectedCategory && <span className="font-semibold text-gray-800">{selectedCategory}</span>}
        </div>
    )

    if (loading) return <p className="p-8">Loading data...</p>;
    if (error) return <p className="p-8 text-red-500">{error}</p>;

    // --- MAIN RENDER LOGIC ---

    // VIEW 1: If no team has been selected, we show the list of team cards.
    if (!selectedTeam) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Select a Team to Manage</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <div key={team._id} onClick={() => setSelectedTeam(team)} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 cursor-pointer transition-all">
                            <h2 className="text-xl font-semibold text-gray-700">{team.name}</h2>
                            <p className="text-gray-500 mt-2">Total Points: {team.totalPoints}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!selectedCategory) {
        return (
            <div className="p-8"><Breadcrumbs /><h1 className="text-3xl font-bold text-gray-800 mb-6">Select a Category</h1><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{categories.map(cat => (<div key={cat} onClick={() => setSelectedCategory(cat)} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 cursor-pointer"><h2 className="text-xl font-semibold">{cat}</h2></div>))}</div></div>
        );
    }

    // VIEW 2: If a team HAS been selected, we show the candidate table for that team.
     return (
        <div className="p-8">
            <Breadcrumbs />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manage Candidates</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">+ Add Candidate</button>
            </div>
            <DataTable headers={headers} data={filteredCandidates} renderRow={renderRow} />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add Candidate to ${selectedTeam.name} (${selectedCategory})`}>
                <AddCandidateForm 
                    onFormSubmit={handleFormSubmit}
                    onFormCancel={() => setIsModalOpen(false)}
                    teamId={selectedTeam._id} // Pass the selected team ID
                    categoryName={selectedCategory} // Pass the selected category name
                />
            </Modal>
        </div>
    );
};

export default CandidatesPage;

