import React, { useState, useEffect } from 'react';
import { Search, Plus, Github } from 'lucide-react';

const API_URL = 'http://localhost:8000';

const ServiceCard = ({ service }) => (
  <div className="w-full mb-4 p-6 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200">
    <div className="mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{service.name}</h2>
          <span className="inline-block px-3 py-1 mt-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
            {service.category}
          </span>
        </div>
        <a 
          href={service.website}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Visit Website →
        </a>
      </div>
    </div>
    <p className="text-gray-600 leading-relaxed">{service.description}</p>
  </div>
);

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-8 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

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

  const inputClassName = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className={inputClassName}
        placeholder="Service Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        className={inputClassName}
        placeholder="Category"
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
        required
      />
      <textarea
        className={`${inputClassName} min-h-[100px] resize-none`}
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        required
      />
      <input
        className={inputClassName}
        placeholder="Website URL"
        type="url"
        value={formData.website}
        onChange={(e) => setFormData({...formData, website: e.target.value})}
        required
      />
      <input
        className={inputClassName}
        placeholder="City"
        value={formData.city}
        onChange={(e) => setFormData({...formData, city: e.target.value})}
        required
      />
      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Submit Service
      </button>
    </form>
  );
};

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full p-6 flex justify-between items-center">
        <a href="/" className="text-xl font-bold text-gray-900">CityServices</a>
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/yourusername/city-services-app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            <Github className="h-6 w-6" />
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </button>
        </div>
      </header>

      <main className={`w-full px-6 ${!hasSearched ? 'mt-32' : 'mt-8'} max-w-6xl mx-auto transition-all duration-300`}>
        {!hasSearched && (
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Find Local Services in Your City
          </h1>
        )}
        
        <div className="relative max-w-2xl mx-auto mb-8">
          <input
            list="cities"
            placeholder="Enter city name..."
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-4 pl-12 text-lg border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {hasSearched && (
          <div className="mt-8">
            {services.length > 0 ? (
              <div className="grid gap-4">
                {services.map((service, index) => (
                  <ServiceCard key={index} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No services found</h2>
                <p className="text-gray-600">
                  No services available in {selectedCity}. Would you like to add one?
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Service"
      >
        <SubmitServiceForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default App;