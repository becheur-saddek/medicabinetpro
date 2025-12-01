import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { Patient, Prescription, Medication, SavedMedication } from '../types';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Search,
  Edit2,
  Save,
  X,
  ChevronDown
} from 'lucide-react';

const Prescriptions: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Select Patient, 2: Add Meds
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medForm, setMedForm] = useState<Medication>({ name: '', dosage: '', duration: '', instructions: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [savedMeds, setSavedMeds] = useState<SavedMedication[]>([]);
  
  // Custom Dropdown State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const patients = db.getPatients();
  const filteredPatients = patients.filter(p => 
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setSavedMeds(db.getSavedMedications());
  }, []);

  // Handle click outside suggestions to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMedNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMedForm(prev => ({ ...prev, name: val }));
    setShowSuggestions(true);

    // Keep the "exact match" autofill logic as a fallback
    const found = savedMeds.find(m => m.name.toLowerCase() === val.toLowerCase());
    if (found) {
      setMedForm({
        name: found.name,
        dosage: found.dosage,
        duration: found.duration,
        instructions: found.instructions
      });
    }
  };

  const selectSavedMed = (med: SavedMedication) => {
    setMedForm({
      name: med.name,
      dosage: med.dosage,
      duration: med.duration,
      instructions: med.instructions
    });
    setShowSuggestions(false);
  };

  const handleAddMed = () => {
    if (!medForm.name) return;
    
    if (editingIndex !== null) {
      // Update existing
      const updatedMeds = [...medications];
      updatedMeds[editingIndex] = medForm;
      setMedications(updatedMeds);
      setEditingIndex(null);
    } else {
      // Add new
      setMedications([...medications, medForm]);
    }
    
    // Persist to "Library" of meds for future autocomplete
    db.learnMedication(medForm);
    setSavedMeds(db.getSavedMedications()); // Refresh list

    setMedForm({ name: '', dosage: '', duration: '', instructions: '' });
  };

  const handleEdit = (index: number) => {
    setMedForm(medications[index]);
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setMedForm({ name: '', dosage: '', duration: '', instructions: '' });
    setEditingIndex(null);
  };

  const removeMed = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
    if (editingIndex === index) {
      handleCancelEdit();
    }
  };

  const handleGenerate = () => {
    if (!selectedPatientId || medications.length === 0) return;
    
    const patient = db.getPatient(selectedPatientId);
    if (!patient) return;

    const prescription: Prescription = {
      id: crypto.randomUUID(),
      patientId: patient.id,
      date: Date.now(),
      medications: medications
    };

    db.addPrescription(prescription);
    generatePrescriptionPDF(patient, prescription);
    
    // Reset
    setStep(1);
    setSelectedPatientId(null);
    setMedications([]);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800">Nouvelle Ordonnance</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {/* Progress Stepper */}
        <div className="flex border-b">
          <button 
            className={`flex-1 py-4 text-center font-medium text-sm border-b-2 transition-colors ${step === 1 ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400'}`}
            onClick={() => setStep(1)}
          >
            1. Sélectionner le Patient
          </button>
          <button 
            className={`flex-1 py-4 text-center font-medium text-sm border-b-2 transition-colors ${step === 2 ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400'}`}
            disabled={!selectedPatientId}
            onClick={() => setStep(2)}
          >
            2. Médicaments & Impression
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Rechercher un patient..." 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPatients.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setStep(2);
                    }}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md
                      ${selectedPatientId === p.id 
                        ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' 
                        : 'border-gray-200 hover:border-teal-300'}
                    `}
                  >
                    <div className="font-bold text-gray-800">{p.lastName} {p.firstName}</div>
                    <div className="text-sm text-gray-500">{new Date(p.birthDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedPatientId && (
            <div className="space-y-6">
              {/* Selected Patient Banner */}
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center border border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Patient</span>
                  <div className="font-bold text-slate-800">
                    {db.getPatient(selectedPatientId)?.lastName} {db.getPatient(selectedPatientId)?.firstName}
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-sm text-teal-600 font-medium hover:underline">
                  Changer
                </button>
              </div>

              {/* Add/Edit Med Form */}
              <div className={`p-4 rounded-xl border transition-colors space-y-3 ${editingIndex !== null ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                {editingIndex !== null && (
                  <div className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                    <Edit2 size={14} /> Modification en cours...
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 relative" ref={suggestionsRef}>
                     <div className="relative">
                       <input 
                        type="text"
                        placeholder="Médicament (tapez pour voir la liste)" 
                        className="w-full p-2 pr-8 rounded-lg border focus:ring-2 focus:ring-teal-500 outline-none"
                        value={medForm.name}
                        onChange={handleMedNameChange}
                        onFocus={() => setShowSuggestions(true)}
                        autoComplete="off"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                     </div>
                    
                    {/* Custom Dropdown for Saved Meds */}
                    {showSuggestions && (
                      <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {savedMeds.filter(m => m.name.toLowerCase().includes(medForm.name.toLowerCase())).length === 0 ? (
                           <div className="p-3 text-sm text-gray-400 italic text-center">Aucun médicament enregistré correspondant</div>
                        ) : (
                           savedMeds
                            .filter(m => m.name.toLowerCase().includes(medForm.name.toLowerCase()))
                            .map(m => (
                              <button 
                                  key={m.id}
                                  type="button" 
                                  onClick={() => selectSavedMed(m)}
                                  className="w-full text-left p-3 hover:bg-teal-50 border-b border-gray-50 last:border-0 transition-colors flex justify-between items-center group"
                              >
                                  <div>
                                      <div className="font-bold text-gray-800 text-sm group-hover:text-teal-700">{m.name}</div>
                                      <div className="text-xs text-gray-500">{m.dosage} • {m.instructions.substring(0, 35)}{m.instructions.length > 35 ? '...' : ''}</div>
                                  </div>
                                  <div className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-full group-hover:bg-teal-100 group-hover:text-teal-700 flex-shrink-0 ml-2">
                                       Utilisé {m.usageCount}x
                                  </div>
                              </button>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                  
                  <input 
                    placeholder="Posologie (ex: 1 comprimé)" 
                    className="p-2 rounded-lg border focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medForm.dosage}
                    onChange={e => setMedForm({...medForm, dosage: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   <input 
                    placeholder="Durée (ex: 5 jours)" 
                    className="p-2 rounded-lg border focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medForm.duration}
                    onChange={e => setMedForm({...medForm, duration: e.target.value})}
                  />
                  <input 
                    placeholder="Instructions (ex: Pendant les repas)" 
                    className="md:col-span-2 p-2 rounded-lg border focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medForm.instructions}
                    onChange={e => setMedForm({...medForm, instructions: e.target.value})}
                  />
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleAddMed}
                    disabled={!medForm.name}
                    className={`flex-1 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 font-medium transition-colors
                      ${editingIndex !== null ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-700'}
                    `}
                  >
                    {editingIndex !== null ? <Save size={18} /> : <Plus size={18} />} 
                    {editingIndex !== null ? 'Enregistrer la modification' : 'Ajouter à la liste & Mémoriser'}
                  </button>
                  
                  {editingIndex !== null && (
                    <button 
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                      title="Annuler la modification"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* List of Meds */}
              <div className="space-y-2">
                {medications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Aucun médicament ajouté pour le moment
                  </div>
                ) : (
                  medications.map((med, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-lg shadow-sm border transition-all
                        ${editingIndex === idx ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-gray-200'}
                      `}
                    >
                      <div>
                        <div className={`font-semibold ${editingIndex === idx ? 'text-blue-800' : 'text-gray-800'}`}>{med.name}</div>
                        <div className="text-sm text-gray-500">
                          {med.dosage} - {med.duration}
                        </div>
                        {med.instructions && <div className="text-xs text-gray-400 italic">{med.instructions}</div>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEdit(idx)} 
                          className={`p-2 rounded-lg transition-colors ${editingIndex === idx ? 'bg-blue-200 text-blue-800' : 'text-blue-400 hover:bg-blue-50 hover:text-blue-600'}`}
                          title="Modifier"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => removeMed(idx)} 
                          className="text-red-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step === 2 && (
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button 
              onClick={handleGenerate}
              disabled={medications.length === 0 || editingIndex !== null}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform active:scale-95"
            >
              <Printer size={20} />
              Générer & Imprimer PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;