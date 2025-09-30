import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ResultsPage = () => {
    // Data states
    const [programmes, setProgrammes] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [teams, setTeams] = useState([]);
    const [resultsData, setResultsData] = useState({}); // Stores the form inputs { candidateId: { rank, grade } }

    // States to manage the multi-step selection flow
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProgramme, setSelectedProgramme] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    
    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const categories = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'];

    // 1. Fetch all initial data when the page loads for efficiency
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [progRes, candRes, teamRes] = await Promise.all([
                    api.get('/programmes'),
                    api.get('/candidates'),
                    api.get('/teams')
                ]);
                setProgrammes(progRes.data);
                setCandidates(candRes.data);
                setTeams(teamRes.data);
            } catch (err) {
                setError('Failed to fetch initial data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // 2. Fetch existing PENDING results whenever a programme is selected to pre-fill the form
    useEffect(() => {
        if (selectedProgramme) {
            api.get(`/programmes/${selectedProgramme._id}/results`).then(res => {
                const existingResults = res.data.reduce((acc, result) => {
                    // Only load results that are still pending
                    if (result.status === 'pending') {
                        acc[result.candidate] = { rank: result.rank, grade: result.grade };
                    }
                    return acc;
                }, {});
                setResultsData(existingResults);
            });
        }
    }, [selectedProgramme]);

    // --- EVENT HANDLERS ---
    const handleResultChange = (candidateId, field, value) => {
        setResultsData(prev => ({...prev, [candidateId]: { ...prev[candidateId], [field]: value }}));
    };
    
    // This function now saves the results to the 'pending' state
    const handleSavePending = async () => {
        const resultsPayload = Object.entries(resultsData).map(([candidateId, data]) => ({ 
            candidateId, 
            rank: data.rank ? Number(data.rank) : null, 
            grade: data.grade || null 
        }));
        try {
            await api.post(`/programmes/${selectedProgramme._id}/results`, { results: resultsPayload });
            alert('Results saved to pending! Please go to the "Pending Results" page to approve.');
            handleBackToProgrammes(); // Go back to the start of the workflow
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed to save results.'));
        }
    };

    // Handlers for the "Back" buttons to navigate the workflow
    const handleBackToProgrammes = () => { setSelectedProgramme(null); setSelectedTeam(null); setSelectedCategory(null); setResultsData({}); };
    const handleBackToCategories = () => { setSelectedProgramme(null); setSelectedTeam(null); };

    // --- FILTERING LOGIC ---
    const filteredProgrammes = selectedCategory ? programmes.filter(p => p.category === selectedCategory) : [];
    const filteredCandidates = (selectedTeam && selectedCategory) ? candidates.filter(c => c.team?._id === selectedTeam._id && c.category === selectedCategory) : [];

    // --- RENDER LOGIC ---
    if (loading) return <p className="p-8">Loading...</p>;
    if (error) return <p className="p-8 text-red-500">{error}</p>;

    // VIEW 1: Select Category
    if (!selectedCategory) {
        return (<div className="p-8"><h1 className="text-3xl font-bold mb-6">Step 1: Select a Category</h1><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{categories.map(cat => (<div key={cat} onClick={() => setSelectedCategory(cat)} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer"><h2 className="text-xl font-semibold">{cat}</h2></div>))}</div></div>);
    }
    
    // VIEW 2: Select Programme
    if (!selectedProgramme) {
        return (<div className="p-8"><button onClick={() => setSelectedCategory(null)} className="text-sm text-blue-600 mb-4">&larr; Back to Categories</button><h1 className="text-3xl font-bold mb-6">Step 2: Select a Programme</h1><div className="space-y-4">{filteredProgrammes.length > 0 ? filteredProgrammes.map(prog => (<div key={prog._id} onClick={() => setSelectedProgramme(prog)} className="p-4 bg-white rounded-lg shadow cursor-pointer"><h2 className="text-xl font-semibold">{prog.name}</h2></div>)) : <p>No programmes found for this category.</p>}</div></div>);
    }
    
    // VIEW 3: Select Team
    if (!selectedTeam) {
        return (<div className="p-8"><button onClick={handleBackToCategories} className="text-sm text-blue-600 mb-4">&larr; Back to Programmes</button><h1 className="text-3xl font-bold mb-6">Step 3: Select a Team</h1><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{teams.map(team => (<div key={team._id} onClick={() => setSelectedTeam(team)} className="p-6 bg-white rounded-lg shadow cursor-pointer"><h2 className="text-xl font-semibold">{team.name}</h2></div>))}</div></div>);
    }

    // VIEW 4: Enter Results
    return (
        <div className="p-8">
            <button onClick={() => setSelectedTeam(null)} className="text-sm text-blue-600 mb-2">&larr; Back to Teams</button>
            <h1 className="text-3xl font-bold">Enter Results for {selectedProgramme.name}</h1>
            <p className="text-gray-600">Team: {selectedTeam.name} | Category: {selectedCategory}</p>
            <div className="mt-6 bg-white rounded-lg shadow">
                <table className="min-w-full">
                    <thead><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Candidate</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Rank</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Grade</th></tr></thead>
                    <tbody>
                        {filteredCandidates.map(c => (
                            <tr key={c._id}>
                                <td className="px-6 py-4">{c.name}</td>
                                <td className="px-6 py-4">
                                    <select className="w-full p-2 border rounded" value={resultsData[c._id]?.rank || ''} onChange={e => handleResultChange(c._id, 'rank', e.target.value)}>
                                        <option value="">N/A</option><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <select className="w-full p-2 border rounded" value={resultsData[c._id]?.grade || ''} onChange={e => handleResultChange(c._id, 'grade', e.target.value)}>
                                        <option value="">N/A</option><option value="A">A</option><option value="B">B</option><option value="C">C</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={handleSavePending} className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Save and Add to Pending
                </button>
            </div>
        </div>
    );
};

export default ResultsPage;

