import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { DoctorProfile } from '../types';
import { Save, RefreshCw, AlertTriangle, Lock } from 'lucide-react';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<DoctorProfile>({
    name: '',
    specialty: '',
    address: '',
    phone: '',
    email: '',
    securityCode: ''
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(db.getDoctorProfile());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateDoctorProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("ATTENTION : Cette action effacera TOUTES les données (patients, rdv, ordonnances). Êtes-vous sûr ?")) {
       db.resetDatabase();
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-2xl font-bold text-gray-800">Configuration du Cabinet</h1>

      {/* Doctor Profile Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          Coordonnées du Médecin
        </h2>
        <p className="text-sm text-gray-500 mb-6">Ces informations apparaîtront sur les ordonnances imprimées.</p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input 
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: Dr. Martin Philippe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
              <input 
                name="specialty"
                value={profile.specialty}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: Médecine Générale"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse du cabinet</label>
            <input 
              name="address"
              value={profile.address}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Ex: 10 Rue de la Paix, 75000 Paris"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input 
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: 01 23 45 67 89"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: contact@cabinet.com"
              />
            </div>
          </div>
          
          <hr className="my-6 border-gray-100" />
          
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600" />
            Sécurité
          </h2>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Code d'accès (Login)</label>
            <input 
              name="securityCode"
              value={profile.securityCode}
              onChange={handleChange}
              type="text"
              pattern="\d*"
              maxLength={6}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 tracking-widest font-mono"
              placeholder="0000"
            />
            <p className="text-xs text-gray-500 mt-1">Ce code est requis pour accéder à l'application.</p>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit" 
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 shadow-md"
            >
              <Save size={18} />
              Enregistrer
            </button>
            {saved && <span className="text-green-600 text-sm font-medium animate-pulse">Modifications enregistrées !</span>}
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100">
        <h2 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2">
          <AlertTriangle size={20} />
          Zone de danger
        </h2>
        <p className="text-sm text-red-600 mb-4">
          La réinitialisation effacera toutes les données de l'application (patients, rendez-vous, ordonnances). Cette action est irréversible.
        </p>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-100 font-medium flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Réinitialiser l'application
        </button>
      </div>

      {/* Credits */}
      <div className="text-center pt-8 border-t border-gray-200 mt-8">
        <p className="text-gray-500 text-sm font-medium">
          Application développée par
        </p>
        <p className="text-slate-800 font-bold text-lg mt-1">
          BECHEUR Saddek
        </p>
        <p className="text-teal-600 font-mono mt-1">
          0555323194
        </p>
        <p className="text-gray-400 text-xs mt-4">
          © {new Date().getFullYear()} MediCabinet Pro. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default Settings;