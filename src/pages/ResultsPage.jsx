import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ResultsPage = () => {
    // Data states
    const [programmes, setProgrammes] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [teams, setTeams] = useState([]);
    const [resultsData, setResultsData] = useState({});

    // State for the multi-step selection flow
    const [selectedProgramme, setSelectedProgramme] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const categories = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'];

    // 1. Fetch all initial data when the page loads
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

    // 2. Fetch existing results whenever a programme is selected
    useEffect(() => {
        if (selectedProgramme) {
            setLoading(true);
            api.get(`/programmes/${selectedProgramme._id}/results`)
                .then(res => {
                    const existingResults = res.data.reduce((acc, result) => {
                        acc[result.candidate] = { rank: result.rank, grade: result.grade };
                        return acc;
                    }, {});
                    setResultsData(existingResults);
                })
                .catch(() => setError('Failed to fetch existing results.'))
                .finally(() => setLoading(false));
        }
    }, [selectedProgramme]);

    // --- EVENT HANDLERS ---

    const handleResultChange = (candidateId, field, value) => {
        setResultsData(prev => ({
            ...prev,
            [candidateId]: { ...prev[candidateId], [field]: value },
        }));
    };
    
    const handleSubmitResults = async () => {
        if (Object.keys(resultsData).length === 0) return alert('No results have been entered.');
        const resultsPayload = Object.entries(resultsData).map(([candidateId, data]) => ({
            candidateId, rank: data.rank ? Number(data.rank) : null, grade: data.grade || null,
        }));
        setLoading(true);
        try {
            await api.post(`/programmes/${selectedProgramme._id}/results`, { results: resultsPayload });
            alert('Results saved successfully!');
            const progRes = await api.get('/programmes');
            setProgrammes(progRes.data);
            handleBackToProgrammes(); // Go back to the very first step
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed to submit results.'));
        } finally {
            setLoading(false);
        }
    };

    // Handlers for the "Back" buttons
    const handleBackToProgrammes = () => {
        setSelectedProgramme(null);
        setSelectedTeam(null);
        setSelectedCategory(null);
        setResultsData({});
    };
    const handleBackToTeams = () => {
        setSelectedTeam(null);
        setSelectedCategory(null);
    };

    // --- FILTERING & RENDER LOGIC ---

    const filteredCandidates = (selectedTeam && selectedCategory)
        ? candidates.filter(c => c.team?._id === selectedTeam._id && c.category === selectedCategory)
        : [];

    if (loading && !selectedProgramme) return <p className="p-8">Loading...</p>;
    if (error) return <p className="p-8 text-red-500">{error}</p>;

    // VIEW 1: Select a Programme
    if (!selectedProgramme) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Step 1: Select a Programme</h1>
                <div className="space-y-4">
                    {programmes.map(prog => (
                        <div key={prog._id} onClick={() => setSelectedProgramme(prog)} className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer flex justify-between items-center">
                            <div><h2 className="text-xl font-semibold text-gray-700">{prog.name}</h2><p className="text-sm text-gray-500">{prog.type}</p></div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${prog.isResultPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{prog.isResultPublished ? 'Published' : 'Pending'}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    // VIEW 2: Select a Team
    if (!selectedTeam) {
        return (
            <div className="p-8">
                <button onClick={handleBackToProgrammes} className="text-sm text-blue-600 hover:underline mb-4">&larr; Back to Programmes</button>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Step 2: Select a Team</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <div key={team._id} onClick={() => setSelectedTeam(team)} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 cursor-pointer">
                            <h2 className="text-xl font-semibold text-gray-700">{team.name}</h2>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // VIEW 3: Select a Category
    if (!selectedCategory) {
        return (
            <div className="p-8">
                <button onClick={handleBackToTeams} className="text-sm text-blue-600 hover:underline mb-4">&larr; Back to Teams</button>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Step 3: Select a Category</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(cat => (
                        <div key={cat} onClick={() => setSelectedCategory(cat)} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 cursor-pointer">
                            <h2 className="text-xl font-semibold text-gray-700">{cat}</h2>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    // VIEW 4: Enter Results for the filtered candidates
    return (
        <div className="p-8">
            <div>
                <button onClick={() => setSelectedCategory(null)} className="text-sm text-blue-600 hover:underline mb-2">&larr; Back to Categories</button>
                <h1 className="text-3xl font-bold text-gray-800">Enter Results for {selectedProgramme.name}</h1>
                <p className="text-gray-600">Team: {selectedTeam.name} | Category: {selectedCategory}</p>
            </div>

            {loading && <p className="p-8 text-center">Loading...</p>}
            {!loading && (
                <>
                    <div className="mt-6 bg-white rounded-lg shadow overflow-x-auto">
                        <table className="min-w-full">
                           <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCandidates.length > 0 ? filteredCandidates.map(candidate => (
                                    <tr key={candidate._id}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{candidate.name}</td>
                                        <td className="px-6 py-4">
                                            <select className="w-full p-2 border rounded-md" value={resultsData[candidate._id]?.rank || ''} onChange={(e) => handleResultChange(candidate._id, 'rank', e.target.value)}>
                                                <option value="">N/A</option><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select className="w-full p-2 border rounded-md" value={resultsData[candidate._id]?.grade || ''} onChange={(e) => handleResultChange(candidate._id, 'grade', e.target.value)}>
                                                <option value="">N/A</option><option value="A">A</option><option value="B">B</option><option value="C">C</option>
                                            </select>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="3" className="text-center p-4 text-gray-500">No candidates found for this team and category.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSubmitResults} className="px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 shadow-sm" disabled={loading}>
                            {loading ? 'Saving...' : 'Save & Publish Results'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ResultsPage;

