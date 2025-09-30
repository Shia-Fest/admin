import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PendingResultsPage = () => {
    // This state will store only the programmes that have pending results.
    const [pendingProgrammes, setPendingProgrammes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // We create a single, reusable function to fetch and filter the data.
    const fetchPendingData = async () => {
        try {
            setLoading(true);
            // Step 1: Fetch ALL programmes and ALL results in parallel.
            const [progRes, resultsRes] = await Promise.all([
                api.get('/programmes'),
                api.get('/results') // This is our new endpoint for all results
            ]);

            const allProgrammes = progRes.data;
            const allResults = resultsRes.data;

            // Step 2: Find which programmes have at least one pending result.
            // A Set is a very efficient way to store the unique IDs.
            const programmesWithPendingResults = new Set(
                allResults
                    .filter(result => result.status === 'pending')
                    .map(result => result.programme) // Get the programme ID for each pending result
            );

            // Step 3: Filter the main programme list to only show those with pending results.
            const filteredProgrammes = allProgrammes.filter(prog => 
                programmesWithPendingResults.has(prog._id)
            );
            
            setPendingProgrammes(filteredProgrammes);

        } catch (err) {
            setError('Failed to fetch pending results.');
        } finally {
            setLoading(false);
        }
    };

    // Run the fetch function when the component first loads.
    useEffect(() => {
        fetchPendingData();
    }, []);

    const handleApprove = async (programmeId) => {
        if (window.confirm('Are you sure you want to approve and publish these results? This action cannot be undone.')) {
            try {
                await api.post(`/programmes/${programmeId}/approve`);
                alert('Results approved and published successfully!');
                // After approving, re-run the fetch function to get the updated list.
                fetchPendingData();
            } catch (err) {
                alert('Error: ' + (err.response?.data?.message || 'Failed to approve results.'));
            }
        }
    };
    
    const handleDeny = async (programmeId) => {
        if (window.confirm('Are you sure you want to DENY and DELETE all pending results for this programme? This cannot be undone.')) {
            try {
                // This calls the DELETE endpoint we created
                await api.delete(`/programmes/${programmeId}/results`);
                alert('Pending results have been successfully deleted.');
                fetchPendingData(); // Refresh the list
            } catch (err) {
                alert('Error: ' + (err.response?.data?.message || 'Failed to deny results.'));
            }
        }
    };

    if (loading) return <p className="p-8">Loading...</p>;
    if (error) return <p className="p-8 text-red-500">{error}</p>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Approve Pending Results</h1>
            <p className="text-gray-600 mb-4">This page lists all programmes that currently have results awaiting approval. Approving will calculate points and make results public. Denying will delete the pending entries.</p>
            <div className="space-y-4">
                {pendingProgrammes.length > 0 ? pendingProgrammes.map(prog => (
                    <div key={prog._id} className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold">{prog.name}</h2>
                            <p className="text-sm text-gray-500">{prog.category}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button onClick={() => handleDeny(prog._id)} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">
                                Deny & Delete
                            </button>
                            <button onClick={() => handleApprove(prog._id)} className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                                Approve & Publish
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500">There are no programmes with pending results at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingResultsPage;