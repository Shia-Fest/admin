import React, { useState } from 'react';
import api from '../services/api';

const AddCandidateForm = ({ onFormSubmit, onFormCancel, teamId, categoryName }) => {
    const [formData, setFormData] = useState({
        admissionNo: '',
        name: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!imageFile || !formData.admissionNo || !formData.name) {
            setError('Please fill all fields and select an image.');
            return;
        }
        setLoading(true);

        const submissionData = new FormData();
        submissionData.append('team', teamId);
        submissionData.append('category', categoryName);
        submissionData.append('admissionNo', formData.admissionNo);
        submissionData.append('name', formData.name);
        submissionData.append('image', imageFile);

        try {
            await api.post('/candidates', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onFormSubmit();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add candidate.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <p className="p-3 text-sm font-medium text-red-800 bg-red-100 rounded-lg">
                    {error}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="admissionNo"
                    placeholder="Admission Number"
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                />
                <input
                    type="text"
                    name="name"
                    placeholder="Candidate Name"
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                />
            </div>

            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Candidate Image</label>
                <input
                    type="file"
                    name="image"
                    required
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={onFormCancel}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                    {loading ? 'Adding...' : 'Add Candidate'}
                </button>
            </div>
        </form>
    );
};

export default AddCandidateForm;
