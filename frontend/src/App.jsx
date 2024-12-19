import React, { useState, useEffect } from 'react';
import { Search, Plus, Github, Info } from 'lucide-react';
import { ServiceCard, ServiceSubmissionForm } from './components/ServiceComponents';

const API_URL = 'http://localhost:8000';

// Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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

// Main App Component
const App = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

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

  const searchServices = async (city) => {
    if (!city) {
      setServices([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`${API_URL}/services/${city.trim()}`);
      const data = await response.json();
      const services = data.services;
      
      // Extract unique categories
      const uniqueCategories = [...new Set(services.map(service => service.category))];
      setCategories(uniqueCategories);
      
      // Filter services if category is selected
      const filteredServices = selectedCategory
        ? services.filter(service => service.category === selectedCategory)
        : services;
      
      setServices(filteredServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitService = async (formData) => {
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
        if (selectedCity) {
          searchServices(selectedCity);
        }
      } else {
        throw new Error('Failed to submit service');
      }
    } catch (error) {
      console.error('Error submitting service:', error);
      alert('Error submitting service. Please try again.');
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setSelectedCity(value);
    setSelectedCategory('');  // Reset category filter when city changes
    searchServices(value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const filteredServices = category
      ? services.filter(service => service.category === category)
      : services;
    setServices(filteredServices);
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
          <button
            onClick={() => setIsInfoOpen(true)}
            className="flex items-center bg-gray-300 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
          >
            <Info className="mr-2 h-4 w-4" />
            Info
          </button>
        </div>
      </header>

      <main className="flex-grow w-full px-6 py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Find Local Services</h1>
        <div className="relative mb-6">
          <input
            list="cities"
            placeholder="Enter city name..."
            value={selectedCity}
            onChange={handleCityChange}
            className="w-full p-4 pl-10 text-lg border border-gray-300 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <datalist id="cities">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        {hasSearched && services.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          hasSearched && (
            <div>
              {services.length > 0 ? (
                <div className="grid gap-6">
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
          )
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Service">
        <ServiceSubmissionForm 
          onSubmit={handleSubmitService} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>

      <Modal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="About City Services">
        <div className="space-y-4">
          <p className="text-gray-600">
            Welcome to City Services! We help you discover local services in cities across India through community contributions.
          </p>
          <div>
            <h3 className="font-semibold text-gray-900">Features:</h3>
            <ul className="mt-2 space-y-2 text-gray-600">
              <li>• Search for services by city</li>
              <li>• Filter services by category</li>
              <li>• View detailed service information</li>
              <li>• Add new services to help others</li>
              <li>• Community-driven service verification</li>
            </ul>
          </div>
          <p className="text-gray-600">
            Help grow our community by adding services you know about in your city!
          </p>
        </div>
      </Modal>

      <footer className="text-center p-6 bg-white shadow">
        <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} City Services. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;