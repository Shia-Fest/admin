import React, { useState } from 'react';
import api from '../services/api';

const AddProgrammeForm = ({ onFormSubmit, onFormCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        date: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const programmeTypes = ['Stage', 'Non-Stage', 'Starred', 'Group', 'General', 'Special'];

    const handleChange = (e) => {
        // THE FIX IS HERE: Use e.target.name as the key
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.type || !formData.date) {
            setError('Please fill all required fields.');
            return;
        }
        setLoading(true);

        try {
            await api.post('/programmes', formData);
            onFormSubmit(); // Notify parent component of success
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add programme.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="p-3 my-2 text-sm font-medium text-red-800 bg-red-100 rounded-md">{error}</p>}
            
            <input type="text" name="name" placeholder="Programme Name" required onChange={handleChange} className="w-full px-4 py-2 border rounded-md" />
            
            <select name="type" required onChange={handleChange} className="w-full px-4 py-2 border rounded-md" defaultValue="">
                <option value="" disabled>Select Programme Type</option>
                {programmeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            
            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Date and Time</label>
                <input type="datetime-local" name="date" required onChange={handleChange} className="w-full px-4 py-2 border rounded-md" />
            </div>

            <textarea name="description" placeholder="Description (optional)" onChange={handleChange} className="w-full px-4 py-2 border rounded-md" rows="3"></textarea>
            
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onFormCancel} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                    {loading ? 'Adding...' : 'Add Programme'}
                </button>
            </div>
            
        </form>
        <div>
                                    <button onClick={() => setActivePage('dashboard')} className="w-full px-4 py-2 mb-2 text-left text-gray-700 rounded-md hover:bg-gray-200">Dashboard</button>
                    <button onClick={() => setActivePage('candidates')} className="w-full px-4 py-2 mb-2 text-left text-gray-700 bg-gray-200 rounded-md">Candidates</button>
        </div>
        </main>
    );
};

export default AddProgrammeForm;

