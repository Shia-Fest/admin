import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AddCandidateForm from '../components/AddCandidate';

const CandidatesPage = () => {
  const [teams, setTeams] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamsRes, candidatesRes] = await Promise.all([
          api.get('/teams'),
          api.get('/candidates')
        ]);
        setTeams(teamsRes.data);
        setCandidates(candidatesRes.data);
      } catch (err) {
        setError('Failed to fetch initial data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    api.get('/candidates').then(res => setCandidates(res.data));
  };

  const handleDelete = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await api.delete(`/candidates/${candidateId}`);
        api.get('/candidates').then(res => setCandidates(res.data));
      } catch (err) {
        setError('Failed to delete candidate.');
      }
    }
  };

  const filteredCandidates = selectedTeam
    ? candidates.filter(c => c.team?._id === selectedTeam._id && c.category === selectedCategory)
    : [];

  const headers = ['Image', 'Admission No', 'Name', 'Points', 'Actions'];

  const renderRow = (candidate) => (
    <tr key={candidate._id} className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 whitespace-nowrap">
        <img src={candidate.image.url} alt={candidate.name} className="w-10 h-10 rounded-full object-cover" />
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{candidate.admissionNo}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{candidate.name}</td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{candidate.totalPoints}</td>
      <td className="px-6 py-4 text-sm font-medium flex space-x-4">
        <button className="text-indigo-600 hover:text-indigo-900 transition">Edit</button>
        <button onClick={() => handleDelete(candidate._id)} className="text-red-600 hover:text-red-900 transition">Delete</button>
      </td>
    </tr>
  );

  const Breadcrumbs = () => (
    <div className="text-sm mb-4 text-gray-600 flex flex-wrap items-center gap-2">
      <span onClick={() => { setSelectedTeam(null); setSelectedCategory(null); }} className="hover:underline cursor-pointer">Teams</span>
      {selectedTeam && <span>&gt;</span>}
      {selectedTeam && <span onClick={() => setSelectedCategory(null)} className="hover:underline cursor-pointer">{selectedTeam.name}</span>}
      {selectedCategory && <span>&gt;</span>}
      {selectedCategory && <span className="font-semibold text-gray-800">{selectedCategory}</span>}
    </div>
  );

  if (loading) return <p className="p-8 text-gray-700">Loading data...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  // --- TEAM SELECTION VIEW ---
  if (!selectedTeam) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Select a Team to Manage</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <div
              key={team._id}
              onClick={() => setSelectedTeam(team)}
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg hover:bg-blue-50 cursor-pointer transition"
            >
              <h2 className="text-xl font-semibold text-gray-700">{team.name}</h2>
              <p className="text-gray-500 mt-2">Total Points: {team.totalPoints}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- CATEGORY SELECTION VIEW ---
  if (!selectedCategory) {
    return (
      <div className="p-8">
        <Breadcrumbs />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Select a Category</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg hover:bg-blue-50 cursor-pointer transition"
            >
              <h2 className="text-xl font-semibold text-gray-700">{cat}</h2>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- CANDIDATE TABLE VIEW ---
  return (
    <div className="p-8">
      <Breadcrumbs />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Candidates</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow transition"
        >
          + Add Candidate
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <DataTable headers={headers} data={filteredCandidates} renderRow={renderRow} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Candidate to ${selectedTeam.name} (${selectedCategory})`}
      >
        <AddCandidateForm
          onFormSubmit={handleFormSubmit}
          onFormCancel={() => setIsModalOpen(false)}
          teamId={selectedTeam._id}
          categoryName={selectedCategory}
        />
      </Modal>
    </div>
  );
};

export default CandidatesPage;

