import React, { useEffect, useState } from "react";
import api from '../services/api'
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import AddProgrammeForm from "../components/AddProgrammeForm";

const ProgrammesPage = () => {
    const [programmes, setProgrammes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const categories = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'];

    const fetchProgrammes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/programmes');
            setProgrammes(data);
        } catch (err) {
            setError('Failed to fetch programmes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgrammes();
    }, []);

    const handleFormSubmit = () => {
        setIsModalOpen(false);
        fetchProgrammes(); // Refresh the list after adding
    };
    
    const handleDelete = async (programmeId) => {
        if (window.confirm('Are you sure you want to delete this programme?')) {
            try {
                await api.delete(`/programmes/${programmeId}`);
                fetchProgrammes(); // Refresh the list
            } catch (err) {
                setError('Failed to delete programme.');
            }
        }
    };

    const filteredProgrammes = selectedCategory 
        ? programmes.filter(p => p.category === selectedCategory)
        : [];

    const headers = ['Name', 'Type', 'Date', 'Published', 'Actions'];
    const renderRow = (programme) => (
        <tr key={programme._id}>
            <td className="px-6 py-4">{programme.name}</td>
            <td className="px-6 py-4">{programme.type}</td>
            <td className="px-6 py-4">{new Date(programme.date).toLocaleString()}</td>
            <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs font-semibold rounded-full ${programme.isResultPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{programme.isResultPublished ? 'Yes' : 'No'}</span></td>
            <td className="px-6 py-4"><button onClick={() => handleDelete(programme._id)} className="text-red-600 hover:text-red-900">Delete</button></td>
        </tr>
    );

    if (loading) return <p className="p-8">Loading...</p>;
    if (error) return <p className="p-8 text-red-500">{error}</p>;

    // VIEW 1: Show the list of Categories
    if (!selectedCategory) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Select a Category</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(cat => (
                        <div key={cat} onClick={() => setSelectedCategory(cat)} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 cursor-pointer">
                            <h2 className="text-xl font-semibold">{cat}</h2>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // VIEW 2: Show the filtered list of Programmes for the selected category
    return (
        <div className="p-8">
            <button onClick={() => setSelectedCategory(null)} className="text-sm text-blue-600 hover:underline mb-4">&larr; Back to Categories</button>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manage Programmes for {selectedCategory}</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">+ Add Programme</button>
            </div>
            <DataTable headers={headers} data={filteredProgrammes} renderRow={renderRow} />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add Programme to ${selectedCategory}`}>
                <AddProgrammeForm 
                    onFormSubmit={handleFormSubmit}
                    onFormCancel={() => setIsModalOpen(false)}
                    categoryName={selectedCategory} // Pass the selected category to the form
                />
            </Modal>
        </div>
    );
};

export default ProgrammesPage;
