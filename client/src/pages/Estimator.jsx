import React, { useState, useEffect } from 'react';
import { getConfig, submitEstimate } from '../services/api';
import QuestionField from '../components/dynamic/QuestionField';

export default function Estimator() {
  const [config, setConfig] = useState(null);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [step, setStep] = useState(0);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getConfig()
      .then((res) => {
        setConfig(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load estimator configuration.');
        setLoading(false);
      });
  }, []);

  const handleAnswerChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < config.questions.length) {
      const currentQ = config.questions[step];
      if (currentQ.required && !answers[currentQ.key]) {
        alert('Please answer this question to proceed.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.name || !contact.phone || !contact.email) {
      alert('Please fill out all contact details.');
      return;
    }
    
    try {
      const payload = {
        ...contact,
        answers
      };
      const res = await submitEstimate(payload);
      setEstimate(res.data);
    } catch (err) {
      alert('Failed to submit estimate. Please try again.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!config) return null;

  const isContactStep = step === config.questions.length;
  
  if (estimate) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-xl mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Your Roof Estimate</h2>
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <p className="text-lg text-gray-700 mb-2">Estimated Cost Range:</p>
          <p className="text-4xl font-extrabold text-blue-700">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: config.business.currency }).format(estimate.estimate_low)} 
            {' - '}
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: config.business.currency }).format(estimate.estimate_high)}
          </p>
        </div>
        <p className="text-center mt-6 text-gray-500">
          Thank you, {contact.name}. We will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-12 border border-gray-100">
      <h1 className="text-2xl font-bold text-center mb-2">{config.business.name}</h1>
      <p className="text-center text-gray-500 mb-8">Instant Roof Estimator</p>

      {!isContactStep ? (
        <div>
          <QuestionField
            question={config.questions[step]}
            value={answers[config.questions[step].key]}
            onChange={handleAnswerChange}
          />
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-4">Where should we send your estimate?</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              required
              value={contact.name}
              onChange={handleContactChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              required
              value={contact.phone}
              onChange={handleContactChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={contact.email}
              onChange={handleContactChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
            >
              Get My Estimate
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
