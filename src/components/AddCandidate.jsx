import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AddCandidateForm = ({ onFormSubmit, onFormCancel }) => {
    const [formData, setFormData] = useState({
        admissionNo: '',
        name: '',
        team: '',
        category: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch teams when the component mounts
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const { data } = await api.get('/teams');
                setTeams(data);
            } catch (err) {
                console.error("Failed to fetch teams", err);
            }
        };
        fetchTeams();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // This validation checks for empty strings in dropdowns
        if (!formData.team || !formData.category || !imageFile) {
            setError('Please fill all fields and select an image.');
            return;
        }
        setLoading(true);

        const submissionData = new FormData();
        submissionData.append('admissionNo', formData.admissionNo);
        submissionData.append('name', formData.name);
        submissionData.append('team', formData.team);
        submissionData.append('category', formData.category);
        submissionData.append('image', imageFile);

        try {
            await api.post('/candidates', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onFormSubmit(); // Notify parent component of success
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add candidate.');
        } finally {
            setLoading(false);
        }
    };

    const categories = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="p-3 my-2 text-sm font-medium text-red-800 bg-red-100 rounded-md">{error}</p>}
            <input type="text" name="admissionNo" placeholder="Admission Number" required onChange={handleChange} className="w-full px-4 py-2 border rounded-md" />
            <input type="text" name="name" placeholder="Candidate Name" required onChange={handleChange} className="w-full px-4 py-2 border rounded-md" />
            <select name="team" required onChange={handleChange} className="w-full px-4 py-2 border rounded-md" defaultValue="">
                <option value="" disabled>Select Team</option>
                {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                ))}
            </select>
            <select name="category" required onChange={handleChange} className="w-full px-4 py-2 border rounded-md" defaultValue="">
                <option value="" disabled>Select Category</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Candidate Image</label>
                <input type="file" name="image" required onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onFormCancel} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                    {loading ? 'Adding...' : 'Add Candidate'}
                </button>
            </div>
        </form>
    );
};

export default AddCandidateForm;
