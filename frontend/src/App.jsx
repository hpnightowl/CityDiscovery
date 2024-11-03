import React, { useState, useEffect } from 'react';
import { Search, Plus, Github } from 'lucide-react';

const API_URL = 'http://localhost:8000';

// ServiceCard Component
const ServiceCard = ({ service }) => (
  <div className="service-card p-6 mb-4 transition-shadow duration-200 hover:shadow-lg">
    <h2 className="text-xl font-bold text-gray-900">{service.name}</h2>
    <p className="text-gray-600">{service.description}</p>
    <div className="mt-4">
      <a
        href={service.website}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Visit Website →
      </a>
    </div>
  </div>
);

// Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-8 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Submit Service Form Component
const SubmitServiceForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    website: '',
    city: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/submit-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Service submitted successfully!');
        onClose();
        setFormData({
          name: '',
          category: '',
          description: '',
          website: '',
          city: ''
        });
      }
    } catch (error) {
      console.error('Error submitting service:', error);
      alert('Error submitting service');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full p-3 border border-gray-300 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Service Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
      />
      <input
        className="w-full p-3 border border-gray-300 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Website URL"
        type="url"
        value={formData.website}
        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        required
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
        Submit Service
      </button>
    </form>
  );
};

// Main App Component
const App = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_URL}/cities`);
      const data = await response.json();
      setCities(data.cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const searchServices = async () => {
    if (!selectedCity) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`${API_URL}/services/${selectedCity.trim()}`);
      const data = await response.json();
      setServices(data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchServices();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="flex justify-between items-center p-6 bg-white shadow">
        <h1 className="text-2xl font-bold text-gray-900">City Services</h1>
        <div className="flex items-center gap-4">
          <a href="https://github.com/hpnightowl/CityDiscovery" target="_blank" rel="noopener noreferrer">
            <Github className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </button>
        </div>
      </header>

      <main className="flex-grow w-full px-6 py-8 max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Find Local Services</h1>
        <div className="relative mb-6">
          <input
            list="cities"
            placeholder="Enter city name..."
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-4 pl-10 text-lg border border-gray-300 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <datalist id="cities">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          <button
            onClick={searchServices}
            disabled={loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {hasSearched && (
          <div>
            {services.length > 0 ? (
              <div className="grid gap-4">
                {services.map((service, index) => (
                  <ServiceCard key={index} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No services found</h2>
                <p className="text-gray-600">No services available in {selectedCity}. Would you like to add one?</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Service">
        <SubmitServiceForm onClose={() => setIsModalOpen(false)} />
      </Modal>

      <footer className="text-center p-6 bg-white shadow">
        <p className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} City Services. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;
