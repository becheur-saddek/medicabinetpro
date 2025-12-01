import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Patient, Consultation, Prescription } from '../types';
import { Search, User, Clock, Plus, FileText, ChevronRight, Activity, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Consultations: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientHistory, setPatientHistory] = useState<{
    consultations: Consultation[];
    prescriptions: Prescription[];
  } | null>(null);

  // New Consultation Form State
  const [view, setView] = useState<'list' | 'create'>('list');
  const [newConsultation, setNewConsultation] = useState<Partial<Consultation>>({
    reason: '',
    examination: '',
    diagnosis: '',
    notes: ''
  });

  useEffect(() => {
    setPatients(db.getPatients());
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      const cons = db.getConsultationsByPatient(selectedPatientId);
      const pres = db.getPrescriptionsByPatient(selectedPatientId);
      setPatientHistory({ consultations: cons, prescriptions: pres });
      setView('list'); // Reset view when changing patient
    } else {
      setPatientHistory(null);
    }
  }, [selectedPatientId]);

  const filteredPatients = patients.filter(p => 
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    const consultation: Consultation = {
      id: crypto.randomUUID(),
      patientId: selectedPatientId,
      date: Date.now(),
      reason: newConsultation.reason || '',
      examination: newConsultation.examination || '',
      diagnosis: newConsultation.diagnosis || '',
      notes: newConsultation.notes || ''
    };

    db.addConsultation(consultation);
    
    // Refresh history
    const cons = db.getConsultationsByPatient(selectedPatientId);
    const pres = db.getPrescriptionsByPatient(selectedPatientId);
    setPatientHistory({ consultations: cons, prescriptions: pres });
    
    setView('list');
    setNewConsultation({ reason: '', examination: '', diagnosis: '', notes: '' });
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Left Column: Patient List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-800 mb-2">Patients</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredPatients.map(p => (
            <div 
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3
                ${selectedPatientId === p.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50 border border-transparent'}
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                 ${p.gender === 'Homme' ? 'bg-blue-400' : 'bg-pink-400'}
              `}>
                {p.firstName[0]}{p.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{p.lastName} {p.firstName}</p>
                <p className="text-xs text-gray-500">{new Date(p.birthDate).toLocaleDateString()}</p>
              </div>
              <ChevronRight className={`w-4 h-4 ml-auto ${selectedPatientId === p.id ? 'text-teal-600' : 'text-gray-300'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Details & History */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <User className="w-16 h-16 mb-4 opacity-20" />
            <p>Sélectionnez un patient pour voir son dossier</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-start bg-slate-50">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {db.getPatient(selectedPatientId)?.lastName} {db.getPatient(selectedPatientId)?.firstName}
                </h1>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1"><User size={14}/> {db.getPatient(selectedPatientId)?.gender}</span>
                  <span className="flex items-center gap-1"><Calendar size={14}/> {db.getPatient(selectedPatientId)?.birthDate}</span>
                </div>
                {db.getPatient(selectedPatientId)?.medicalHistory && (
                   <p className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block">
                     ATCD: {db.getPatient(selectedPatientId)?.medicalHistory}
                   </p>
                )}
              </div>
              <div className="flex gap-2">
                {view === 'list' ? (
                  <button 
                    onClick={() => setView('create')}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-colors"
                  >
                    <Plus size={18} /> Nouvelle Consultation
                  </button>
                ) : (
                  <button 
                    onClick={() => setView('list')}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {view === 'create' ? (
                <form onSubmit={handleSaveConsultation} className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motif de consultation</label>
                    <input 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: Fièvre et toux"
                      value={newConsultation.reason}
                      onChange={e => setNewConsultation({...newConsultation, reason: e.target.value})}
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Examen Clinique</label>
                    <textarea 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500 h-24"
                      placeholder="Observations, constantes..."
                      value={newConsultation.examination}
                      onChange={e => setNewConsultation({...newConsultation, examination: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostic</label>
                    <input 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
                      placeholder="Diagnostic suspecté ou confirmé"
                      value={newConsultation.diagnosis}
                      onChange={e => setNewConsultation({...newConsultation, diagnosis: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
                    <textarea 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-500 h-20"
                      value={newConsultation.notes}
                      onChange={e => setNewConsultation({...newConsultation, notes: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700">
                      Enregistrer la consultation
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  {/* Timeline */}
                  {!patientHistory?.consultations.length && !patientHistory?.prescriptions.length ? (
                    <div className="text-center py-10 text-gray-400">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Aucun historique médical enregistré.</p>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-gray-100 ml-4 space-y-8">
                      {/* Combine arrays would be better in real app, here we just show Consultations then Prescriptions or interleaved manually logic needed for strict timeline, but let's show lists */}
                      
                      {/* Consultations List */}
                      {patientHistory.consultations.map(c => (
                        <div key={c.id} className="relative pl-8">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-sm"></div>
                          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-bold text-teal-700">Consultation</span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={12} /> {new Date(c.date).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1">{c.reason}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              {c.diagnosis && <p><span className="font-medium">Diagnostic:</span> {c.diagnosis}</p>}
                              {c.examination && <p className="italic text-gray-500">"{c.examination}"</p>}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Prescriptions List (embedded in timeline visually) */}
                      {patientHistory.prescriptions.map(p => (
                        <div key={p.id} className="relative pl-8">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500 border-4 border-white shadow-sm"></div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-bold text-purple-700">Ordonnance</span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={12} /> {new Date(p.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {p.medications.map((m, i) => (
                                <span key={i} className="text-xs bg-white border px-2 py-1 rounded text-gray-600">
                                  {m.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Consultations;