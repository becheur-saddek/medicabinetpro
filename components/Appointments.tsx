import React, { useState } from 'react';
import { db } from '../services/db';
import { Appointment } from '../types';
import { Plus, Check, X, Clock } from 'lucide-react';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(db.getAppointments());
  const patients = db.getPatients();
  const [showModal, setShowModal] = useState(false);
  const [newApt, setNewApt] = useState<Partial<Appointment>>({ date: Date.now() });

  const getPatientName = (id: string) => {
    const p = patients.find(pat => pat.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Inconnu';
  };

  const handleStatusChange = (id: string, status: 'completed' | 'cancelled') => {
    db.updateAppointmentStatus(id, status);
    setAppointments(db.getAppointments());
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.patientId || !newApt.date || !newApt.reason) return;

    db.addAppointment({
      id: crypto.randomUUID(),
      patientId: newApt.patientId,
      date: new Date(newApt.date).getTime(),
      reason: newApt.reason,
      status: 'scheduled'
    });
    setAppointments(db.getAppointments());
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Rendez-vous</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          Nouveau RDV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Heure / Date</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Patient</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Motif</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Statut</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Aucun rendez-vous prévu.</td>
                </tr>
              ) : (
                appointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {new Date(apt.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{getPatientName(apt.patientId)}</td>
                    <td className="p-4 text-gray-600">{apt.reason}</td>
                    <td className="p-4">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-semibold
                        ${apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : ''}
                        ${apt.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                        ${apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {apt.status === 'scheduled' && 'Prévu'}
                        {apt.status === 'completed' && 'Terminé'}
                        {apt.status === 'cancelled' && 'Annulé'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {apt.status === 'scheduled' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleStatusChange(apt.id, 'completed')}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Terminer"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                             onClick={() => handleStatusChange(apt.id, 'cancelled')}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Annuler"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Planifier un RDV</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  required
                  onChange={e => setNewApt({...newApt, patientId: e.target.value})}
                >
                  <option value="">Choisir...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date et Heure</label>
                <input 
                  type="datetime-local" 
                  className="w-full border rounded-lg p-2"
                  required
                  onChange={e => setNewApt({...newApt, date: new Date(e.target.value).getTime()})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motif</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg p-2"
                  placeholder="Ex: Consultation générale"
                  required
                  onChange={e => setNewApt({...newApt, reason: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg">Annuler</button>
                <button type="submit" className="flex-1 py-2 bg-teal-600 text-white rounded-lg">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;