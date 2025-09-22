import React, { useEffect, useState } from "react";
import api from '../services/api'
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import AddProgrammeForm from "../components/AddProgrammeForm";

const ProgrammesPage = () => {
    const [ programmes, setProgrammes ] = useState([]);
    const [ loading, setLoading ] = useState(true)
    const [ error, setError] = useState('')
    const [ isModalOpen, setIsModalOpen ] = useState(false);

    const fetchProgrammes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/programmes');
            setProgrammes(data)
        }
        catch (err) {
            setError( err.response?.data?.message || 'Programme Fetching Failed')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProgrammes();
    }, []);

    const handleFormSubmit = () => {
        setIsModalOpen(false)
        fetchProgrammes()
    };

    const handleDelete = async (programmeId) => {
        if(window.confirm('Are you sure want to delete the programme?')) {
            try {
                await api.delete(`/programmes/${programmeId}`)
                fetchProgrammes()
            }
            catch (err) {
                setError('Programme deleting failed.')
            } 
        }
    }

    const headers = ['Name', 'Type', 'Date', 'Published', 'Actions'];
    const renderRow = (programme) => (
        <tr key={programme._id}>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">{programme.name}</td>
            <td className="px-6 py-4 text-sm text-gray-500">{programme.type}</td>
            <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(programme.date).toLocaleString()}
            </td>
            <td className="px-6 py-4 text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${programme.isResultPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {programme.isResultPublished ? 'Yes' : 'No'}
                </span>
            </td>
            <td className="px-6 py-4 text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                <button onClick={() => handleDelete(programme._id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    );

    return  (
        <div>
            <div className="flex justify-between">
                <h1>Manage Programmes</h1>
                <button onClick={() => setIsModalOpen(true)}>
                    + Add Programme
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && (
                <DataTable headers={headers} data={programmes} renderRow={renderRow} />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <AddProgrammeForm
                    onFormSubmit={handleFormSubmit}
                    onFormCancel={() => setIsModalOpen(false)}
                 />
            </Modal>
        </div>
    )
}

export default ProgrammesPage;