import React, { useState } from 'react';
import { MapPin, Clock, Star, CheckCircle } from 'lucide-react';

// Enhanced Service Card Component
export const ServiceCard = ({ service }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatOperatingHours = (hours) => {
    if (!hours) return 'Operating hours not specified';
    return `${hours.opens_at} - ${hours.closes_at} (${hours.days.join(', ')})`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4 transition-all duration-200 hover:shadow-xl">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            {service.name}
            {service.is_verified && (
              <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
            )}
          </h2>
          <p className="text-sm text-gray-500">{service.category}</p>
        </div>
        <div className="flex items-center">
          <Star className="h-5 w-5 text-yellow-400" />
          <span className="ml-1 text-gray-700">{service.rating.toFixed(1)}</span>
          <span className="text-sm text-gray-500 ml-1">({service.total_ratings})</span>
        </div>
      </div>

      <p className="mt-2 text-gray-600">{service.description}</p>

      <div className="mt-4 space-y-2">
        {service.areas && service.areas.map((area, index) => (
          <div key={index} className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{area.city}</span>
            {area.localities && area.localities.length > 0 && (
              <span className="ml-1 text-gray-400">
                ({area.localities.join(', ')})
              </span>
            )}
          </div>
        ))}

        {service.operating_hours && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{formatOperatingHours(service.operating_hours)}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        {showDetails ? 'Show less' : 'Show more'}
      </button>

      {showDetails && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {service.pricing_tiers && service.pricing_tiers.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900">Pricing Tiers</h3>
              <div className="mt-2 space-y-2">
                {service.pricing_tiers.map((tier, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="font-medium">{tier.name}</span>
                    <span className="text-gray-600">{tier.price_range}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {service.features && service.features.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900">Features</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {service.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <a
              href={service.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Visit Website
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Service Submission Form
export const ServiceSubmissionForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    website: '',
    city: '',
    localities: '',
    operating_hours: {
      opens_at: '',
      closes_at: '',
      days: []
    },
    pricing_tiers: [
      { name: '', description: '', price_range: '' }
    ],
    features: ''
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submissionData = {
      ...formData,
      localities: formData.localities.split(',').map(loc => loc.trim()).filter(loc => loc),
      features: formData.features.split(',').map(feature => feature.trim()).filter(feature => feature),
      operating_hours: formData.operating_hours.opens_at ? {
        ...formData.operating_hours,
        days: formData.operating_hours.days || []
      } : null,
      pricing_tiers: formData.pricing_tiers.filter(tier => tier.name && tier.price_range)
    };

    try {
      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error('Error submitting service:', error);
      alert('Error submitting service. Please try again.');
    }
  };

  const handlePricingTierChange = (index, field, value) => {
    const newPricingTiers = [...formData.pricing_tiers];
    newPricingTiers[index] = { ...newPricingTiers[index], [field]: value };
    setFormData({ ...formData, pricing_tiers: newPricingTiers });
  };

  const addPricingTier = () => {
    setFormData({
      ...formData,
      pricing_tiers: [...formData.pricing_tiers, { name: '', description: '', price_range: '' }]
    });
  };

  const removePricingTier = (index) => {
    const newPricingTiers = formData.pricing_tiers.filter((_, i) => i !== index);
    setFormData({ ...formData, pricing_tiers: newPricingTiers });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Service Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />

        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={3}
        />

        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Website URL"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />

          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Localities (comma-separated)"
            value={formData.localities}
            onChange={(e) => setFormData({ ...formData, localities: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Operating Hours</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              type="time"
              value={formData.operating_hours.opens_at}
              onChange={(e) => setFormData({
                ...formData,
                operating_hours: { ...formData.operating_hours, opens_at: e.target.value }
              })}
            />
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              type="time"
              value={formData.operating_hours.closes_at}
              onChange={(e) => setFormData({
                ...formData,
                operating_hours: { ...formData.operating_hours, closes_at: e.target.value }
              })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => (
              <button
                key={day}
                type="button"
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.operating_hours.days.includes(day)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  const days = formData.operating_hours.days.includes(day)
                    ? formData.operating_hours.days.filter(d => d !== day)
                    : [...formData.operating_hours.days, day];
                  setFormData({
                    ...formData,
                    operating_hours: { ...formData.operating_hours, days }
                  });
                }}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Pricing Tiers</h3>
          {formData.pricing_tiers.map((tier, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-lg">
              <div className="flex justify-between">
                <input
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Tier Name"
                  value={tier.name}
                  onChange={(e) => handlePricingTierChange(index, 'name', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removePricingTier(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              <input
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Price Range"
                value={tier.price_range}
                onChange={(e) => handlePricingTierChange(index, 'price_range', e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addPricingTier}
            className="w-full p-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            Add Pricing Tier
          </button>
        </div>

        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Features (comma-separated)"
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Submit Service
        </button>
      </div>
    </form>
  );
};