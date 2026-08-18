import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, getAdminConfig, updateConfig } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export default function Admin() {
  const [leads, setLeads] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('ownerToken')) {
      navigate('/login');
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [leadsRes, configRes] = await Promise.all([getLeads(), getAdminConfig()]);
        setLeads(leadsRes.data);
        setConfig(configRes.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('ownerToken');
          navigate('/login');
        }
      }
    };

    fetchInitialData();

    // Auto-update leads every 10 seconds
    const interval = setInterval(() => {
      getLeads()
        .then(res => setLeads(res.data))
        .catch(err => {
          if (err.response?.status === 401) {
            localStorage.removeItem('ownerToken');
            navigate('/login');
          }
        });
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleConfigChange = (questionIndex, field, value) => {
    const newConfig = { ...config };
    newConfig.questions[questionIndex][field] = value;
    setConfig(newConfig);
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const newConfig = { ...config };
    newConfig.questions[questionIndex].options[optionIndex][field] = Number(value);
    setConfig(newConfig);
  };

  const handleSaveConfig = async () => {
    setSaveStatus('Saving...');
    try {
      await updateConfig(config);
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('Error saving config.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Owner Dashboard</h1>
        <Button variant="outline" onClick={() => { localStorage.removeItem('ownerToken'); navigate('/login'); }} className="bg-white/80 hover:bg-white shadow-sm border-slate-200 text-slate-700">
          Logout
        </Button>
      </div>

      <Tabs defaultValue="leads">
        <TabsList className="mb-8">
          <TabsTrigger value="leads">Captured Leads</TabsTrigger>
          <TabsTrigger value="config">Pricing Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <div className="rounded-xl shadow-2xl border-0 ring-1 ring-slate-900/5 bg-white/90 backdrop-blur-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Answers</TableHead>
                  <TableHead className="text-right">Estimate Range</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="whitespace-nowrap">{new Date(lead.captured_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.phone}</div>
                      <div className="text-sm text-slate-500">{lead.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600 max-w-xs truncate">
                        {Object.entries(lead.answers).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap font-semibold">
                      ${lead.estimate_low.toLocaleString()} - ${lead.estimate_high.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {leads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No leads captured yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="config">
          <div className="rounded-xl shadow-2xl border-0 ring-1 ring-slate-900/5 bg-white/90 backdrop-blur-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Estimator Questions & Rates</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-green-600">{saveStatus}</span>
                <Button onClick={handleSaveConfig}>Save Changes</Button>
              </div>
            </div>
            
            <div className="space-y-8">
              {config?.questions.map((q, qIndex) => (
                <div key={q.key} className="border p-4 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Label className="text-lg font-bold">{q.label}</Label>
                      <span className="text-xs bg-slate-200 px-2 py-1 rounded">{q.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${q.key}`}>Active</Label>
                      <Switch 
                        id={`active-${q.key}`} 
                        checked={q.active} 
                        onCheckedChange={(val) => handleConfigChange(qIndex, 'active', val)} 
                      />
                    </div>
                  </div>

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {q.options.map((opt, optIndex) => (
                        <div key={opt.value} className="bg-white p-3 border rounded shadow-sm">
                          <p className="font-medium mb-2">{opt.label}</p>
                          
                          {opt.rate_per_sqft !== undefined && (
                            <div className="flex flex-col gap-1">
                              <Label className="text-xs text-slate-500">Rate per SqFt ($)</Label>
                              <Input 
                                type="number" 
                                step="0.01" 
                                value={opt.rate_per_sqft} 
                                onChange={(e) => handleOptionChange(qIndex, optIndex, 'rate_per_sqft', e.target.value)} 
                              />
                            </div>
                          )}
                          
                          {opt.multiplier !== undefined && (
                            <div className="flex flex-col gap-1">
                              <Label className="text-xs text-slate-500">Multiplier (e.g. 1.12)</Label>
                              <Input 
                                type="number" 
                                step="0.01" 
                                value={opt.multiplier} 
                                onChange={(e) => handleOptionChange(qIndex, optIndex, 'multiplier', e.target.value)} 
                              />
                            </div>
                          )}

                          {opt.tear_off_per_sqft !== undefined && (
                            <div className="flex flex-col gap-1">
                              <Label className="text-xs text-slate-500">Tear Off per SqFt ($)</Label>
                              <Input 
                                type="number" 
                                step="0.01" 
                                value={opt.tear_off_per_sqft} 
                                onChange={(e) => handleOptionChange(qIndex, optIndex, 'tear_off_per_sqft', e.target.value)} 
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button onClick={handleSaveConfig} size="lg">Save All Changes</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
