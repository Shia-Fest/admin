import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ResultsPage = () => {
    // Data states
    const [programmes, setProgrammes] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [teams, setTeams] = useState([]);
    const [resultsData, setResultsData] = useState({});

    // States to manage the multi-step selection flow
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProgramme, setSelectedProgramme] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    
    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const categories = [
        { id: 'BIDAYA', name: 'Bidaya', color: 'from-blue-500 to-cyan-500' },
        { id: 'ULA', name: 'Ula', color: 'from-green-500 to-emerald-500' },
        { id: 'THANIYYAH', name: 'Thaniyyah', color: 'from-purple-500 to-indigo-500' },
        { id: 'THANAWIYYAH', name: 'Thanawiyyah', color: 'from-orange-500 to-red-500' },
        { id: 'ALIYA', name: 'Aliya', color: 'from-pink-500 to-rose-500' }
    ];

    // Fetch all initial data
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

    // Fetch existing PENDING results
    useEffect(() => {
        if (selectedProgramme) {
            api.get(`/programmes/${selectedProgramme._id}/results`).then(res => {
                const existingResults = res.data.reduce((acc, result) => {
                    if (result.status === 'pending') {
                        acc[result.candidate] = { rank: result.rank, grade: result.grade };
                    }
                    return acc;
                }, {});
                setResultsData(existingResults);
            });
        }
    }, [selectedProgramme]);

    // Event Handlers
    const handleResultChange = (candidateId, field, value) => {
        setResultsData(prev => ({
            ...prev, 
            [candidateId]: { 
                ...prev[candidateId], 
                [field]: value 
            }
        }));
    };
    
    const handleSavePending = async () => {
        setSaving(true);
        const resultsPayload = Object.entries(resultsData).map(([candidateId, data]) => ({ 
            candidateId, 
            rank: data.rank ? Number(data.rank) : null, 
            grade: data.grade || null 
        }));
        
        try {
            await api.post(`/programmes/${selectedProgramme._id}/results`, { results: resultsPayload });
            // Show success notification
            alert('Results saved to pending! Please go to the "Pending Results" page to approve.');
            
            // MODIFIED: Only go back to team selection instead of all the way to categories
            handleBackToTeams();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed to save results.'));
        } finally {
            setSaving(false);
        }
    };

    // MODIFIED: Added new handler to go back to teams only
    const handleBackToTeams = () => { 
        setSelectedTeam(null); 
        setResultsData({}); 
    };

    const handleBackToProgrammes = () => { 
        setSelectedProgramme(null); 
        setSelectedTeam(null); 
        setResultsData({}); 
    };

    const handleBackToCategories = () => { 
        setSelectedProgramme(null); 
        setSelectedTeam(null); 
    };

    // Filtering Logic
    const filteredProgrammes = selectedCategory ? 
        programmes.filter(p => p.category === selectedCategory.id) : [];
    
    const filteredCandidates = (selectedTeam && selectedCategory) ? 
        candidates.filter(c => c.team?._id === selectedTeam._id && c.category === selectedCategory.id) : [];

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // VIEW 1: Select Category
    if (!selectedCategory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Enter Competition Results</h1>
                        <p className="text-lg text-gray-600">Select a category to begin entering results</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map(cat => (
                            <div 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className={`bg-gradient-to-br ${cat.color} rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group`}
                            >
                                <div className="text-white text-center">
                                    <h2 className="text-2xl font-bold mb-2 group-hover:scale-110 transition-transform">
                                        {cat.name}
                                    </h2>
                                    <p className="opacity-90">Click to select</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    
    // VIEW 2: Select Programme
    if (!selectedProgramme) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center mb-8">
                        <button 
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mr-4"
                        >
                            <span className="text-2xl">←</span>
                            <span className="ml-2 font-medium">Back to Categories</span>
                        </button>
                        <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Select Programme
                        </h1>
                        <p className="text-gray-600 mb-8">Category: {selectedCategory.name}</p>
                        
                        <div className="space-y-4">
                            {filteredProgrammes.length > 0 ? (
                                filteredProgrammes.map(prog => (
                                    <div 
                                        key={prog._id}
                                        onClick={() => setSelectedProgramme(prog)}
                                        className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-300 group"
                                    >
                                        <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-700">
                                            {prog.name}
                                        </h2>
                                        <p className="text-gray-600 mt-1">{prog.description || 'No description available'}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Programmes Found</h3>
                                    <p className="text-gray-500">No programmes available for this category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    // VIEW 3: Select Team
    if (!selectedTeam) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center mb-8">
                        <button 
                            onClick={handleBackToCategories}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mr-4"
                        >
                            <span className="text-2xl">←</span>
                            <span className="ml-2 font-medium">Back to Programmes</span>
                        </button>
                        <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Team</h1>
                        <p className="text-gray-600 mb-8">
                            Category: {selectedCategory.name} • Programme: {selectedProgramme.name}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teams.map(team => (
                                <div 
                                    key={team._id}
                                    onClick={() => setSelectedTeam(team)}
                                    className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                            <span className="text-2xl">👥</span>
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-800">{team.name}</h2>
                                        <p className="text-gray-600 text-sm mt-1">{team.location || 'No location specified'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // VIEW 4: Enter Results
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center mb-8">
                    <button 
                        onClick={handleBackToTeams} // MODIFIED: Use the new handler
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mr-4"
                    >
                        <span className="text-2xl">←</span>
                        <span className="ml-2 font-medium">Back to Teams</span>
                    </button>
                    <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">Enter Results</h1>
                        <div className="flex flex-wrap gap-4 text-blue-100">
                            <span className="flex items-center">
                                <span className="mr-2">📋</span>
                                {selectedProgramme.name}
                            </span>
                            <span className="flex items-center">
                                <span className="mr-2">👥</span>
                                {selectedTeam.name}
                            </span>
                            <span className="flex items-center">
                                <span className="mr-2">🏷️</span>
                                {selectedCategory.name}
                            </span>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                                            Candidate
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                                            Grade
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredCandidates.map(candidate => (
                                        <tr key={candidate._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                                                        {candidate.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{candidate.name}</p>
                                                        <p className="text-sm text-gray-500">{candidate.registrationNumber || 'No ID'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <select 
                                                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    value={resultsData[candidate._id]?.rank || ''}
                                                    onChange={e => handleResultChange(candidate._id, 'rank', e.target.value)}
                                                >
                                                    <option value="">Select Rank</option>
                                                    <option value="1">🥇 1st</option>
                                                    <option value="2">🥈 2nd</option>
                                                    <option value="3">🥉 3rd</option>
                                                </select>
                                            </td>
                                            <td className="py-4 px-6">
                                                <select 
                                                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    value={resultsData[candidate._id]?.grade || ''}
                                                    onChange={e => handleResultChange(candidate._id, 'grade', e.target.value)}
                                                >
                                                    <option value="">Select Grade</option>
                                                    <option value="A" className="text-green-600">A (Excellent)</option>
                                                    <option value="B" className="text-blue-600">B (Good)</option>
                                                    <option value="C" className="text-yellow-600">C (Average)</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredCandidates.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">😕</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Candidates Found</h3>
                                <p className="text-gray-500">No candidates available for the selected team and category.</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-gray-200 px-8 py-6 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                                {Object.keys(resultsData).length} candidate(s) with data
                            </span>
                            <button 
                                onClick={handleSavePending}
                                disabled={saving || Object.keys(resultsData).length === 0}
                                className={`px-8 py-3 font-semibold text-white rounded-lg transition-all duration-300 flex items-center ${
                                    saving || Object.keys(resultsData).length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span className="mr-2">💾</span>
                                        Save to Pending Results
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;