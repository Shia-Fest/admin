import React, { useState } from 'react';
import api from '../services/api';

// This form now accepts the pre-selected categoryName as a prop
const AddProgrammeForm = ({ onFormSubmit, onFormCancel, categoryName }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        date: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const programmeTypes = ['Stage', 'Non-Stage', 'Starred', 'Group', 'General', 'Special'];

    const handleChange = (e) => {
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
            // It now includes the categoryName in the data sent to the API
            await api.post('/programmes', { ...formData, category: categoryName });
            onFormSubmit();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add programme.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="p-3 my-2 text-sm text-red-800 bg-red-100 rounded-md">{error}</p>}
            <input type="text" name="name" placeholder="Programme Name" required onChange={handleChange} className="w-full px-4 py-2 border rounded-md" />
            <select name="type" required onChange={handleChange} className="w-full px-4 py-2 border rounded-md" defaultValue="">
                <option value="" disabled>Select Programme Type</option>
                {programmeTypes.map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
            <div>
                <label className="block mb-1 text-sm font-medium">Date and Time</label>
                <input type="datetime-local" name="date" required onChange={handleChange} className="w-full px-4 py-2 border rounded-md" />
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onFormCancel} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                    {loading ? 'Adding...' : 'Add Programme'}
                </button>
            </div>
        </form>
    );
};

export default AddProgrammeForm;

