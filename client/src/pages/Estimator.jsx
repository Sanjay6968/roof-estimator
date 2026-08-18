import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getConfig, submitEstimate } from '../services/api';
import QuestionField from '../components/dynamic/QuestionField';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

export default function Estimator() {
  const [config, setConfig] = useState(null);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [step, setStep] = useState(0);
  const [estimate, setEstimate] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    getConfig()
      .then((res) => {
        setConfig(res.data);
        setDisplayCurrency(res.data.business.currency);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load estimator configuration.');
        setLoading(false);
      });
  }, []);

  const handleAnswerChange = (key, value) => {
    setValidationError('');
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleContactChange = (e) => {
    setSubmitError('');
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < config.questions.length) {
      const currentQ = config.questions[step];
      if (currentQ.required && !answers[currentQ.key]) {
        setValidationError('Please answer this question to proceed.');
        return;
      }
      
      if (currentQ.type === 'number') {
        const val = Number(answers[currentQ.key]);
        if (val < currentQ.min || val > currentQ.max) {
          setValidationError(`Value must be between ${currentQ.min} and ${currentQ.max}.`);
          return;
        }
      }
    }
    setValidationError('');
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setValidationError('');
    setSubmitError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.name || !contact.phone || !contact.email) {
      setSubmitError('Please fill out all contact details.');
      return;
    }

    const phoneDigits = contact.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setSubmitError('Please enter a valid 10-digit phone number.');
      return;
    }
    
    try {
      const payload = {
        ...contact,
        answers,
        config_version: config.config_version
      };
      const res = await submitEstimate(payload);
      setEstimate(res.data);
    } catch (err) {
      if (err.response && err.response.status === 410) {
        setSubmitError('This estimate session has expired due to pricing updates. Please refresh the page to restart.');
      } else {
        setSubmitError('Failed to submit estimate. Please try again.');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading estimator...</div>;
  if (error) return <div className="p-8 text-center text-red-600 font-medium">{error}</div>;
  if (!config) return null;

  const isContactStep = step === config.questions.length;
  
  if (estimate) {
    const conversionRate = config.modifiers?.currency_rates?.[displayCurrency] || 1;
    const dispLow = estimate.estimate_low * conversionRate;
    const dispHigh = estimate.estimate_high * conversionRate;
    
    return (
      <div className="w-full max-w-xl mx-auto p-4">
        <Card className="shadow-2xl border-0 ring-1 ring-slate-900/5 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
          <CardHeader className="pb-8">
            <CardTitle className="text-center text-3xl font-extrabold tracking-tight text-slate-900">Your Roof Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 p-6 rounded-lg text-center relative">
              <div className="absolute top-4 right-4">
                <select 
                  className="bg-transparent text-sm text-slate-500 font-medium outline-none border-b border-slate-300 pb-1 cursor-pointer"
                  value={displayCurrency}
                  onChange={(e) => setDisplayCurrency(e.target.value)}
                >
                  {Object.keys(config.modifiers?.currency_rates || { USD: 1 }).map(cur => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
              <p className="text-lg text-slate-700 mb-2 mt-4">Estimated Cost Range:</p>
              <p className="text-4xl font-extrabold text-slate-900">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: displayCurrency, maximumFractionDigits: 0 }).format(dispLow)} 
                {' - '}
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: displayCurrency, maximumFractionDigits: 0 }).format(dispHigh)}
              </p>
            </div>
            <p className="text-center mt-6 text-slate-500">
              Thank you, {contact.name}. We will be in touch shortly.
            </p>
          </CardContent>
        </Card>
        <div className="text-center mt-8">
          <Link to="/admin" className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">Owner Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <Card className="shadow-2xl border-0 ring-1 ring-slate-900/5 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
        <CardHeader className="pb-8">
          <CardTitle className="text-center text-3xl font-extrabold tracking-tight text-slate-900">{config.business.name}</CardTitle>
          <CardDescription className="text-center text-base mt-2">Instant Roof Estimator</CardDescription>
        </CardHeader>
        <CardContent>
          {!isContactStep ? (
            <div>
              <QuestionField
                question={config.questions[step]}
                value={answers[config.questions[step].key]}
                onChange={handleAnswerChange}
              />
              {validationError && <p className="text-red-500 text-sm mt-2 font-medium">{validationError}</p>}
            </div>
          ) : (
            <form id="contact-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h2 className="text-xl font-bold mb-2">Where should we send your estimate?</h2>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input type="text" id="name" name="name" required value={contact.name} onChange={handleContactChange} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input type="tel" id="phone" name="phone" pattern="\d{10}" title="10-digit phone number" minLength={10} maxLength={10} required value={contact.phone} onChange={handleContactChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" name="email" required value={contact.email} onChange={handleContactChange} />
              </div>
              {submitError && <p className="text-red-500 text-sm font-medium">{submitError}</p>}
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            Back
          </Button>
          {!isContactStep ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button type="submit" form="contact-form" variant="default">Get My Estimate</Button>
          )}
        </CardFooter>
      </Card>
      <div className="text-center mt-8">
        <Link to="/admin" className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">Owner Login</Link>
      </div>
    </div>
  );
}
