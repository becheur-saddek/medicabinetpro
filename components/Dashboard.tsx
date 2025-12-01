import React, { useMemo } from 'react';
import { db } from '../services/db';
import { 
  Users, 
  CalendarClock, 
  FileCheck, 
  TrendingUp 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  // In a real app, use useQuery or similar, here we read direct for sync "offline" feel
  const patients = db.getPatients();
  const appointments = db.getAppointments();
  const prescriptions = db.getPrescriptions();

  const today = new Date().setHours(0,0,0,0);
  const appointmentsToday = appointments.filter(a => {
    const d = new Date(a.date).setHours(0,0,0,0);
    return d === today;
  }).length;

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: Users, color: 'bg-blue-500' },
    { label: 'RDV Aujourd\'hui', value: appointmentsToday, icon: CalendarClock, color: 'bg-teal-500' },
    { label: 'Ordonnances (Mois)', value: prescriptions.length, icon: FileCheck, color: 'bg-purple-500' },
    { label: 'Consultations', value: appointments.length, icon: TrendingUp, color: 'bg-orange-500' },
  ];

  const genderData = useMemo(() => {
    const counts = { Homme: 0, Femme: 0, Autre: 0 };
    patients.forEach(p => {
      if (counts[p.gender] !== undefined) counts[p.gender]++;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key as keyof typeof counts] }));
  }, [patients]);

  const COLORS = ['#3b82f6', '#ec4899', '#9ca3af'];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 text-white`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Appointments Trend (Simulated) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Activité de la semaine</h2>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Lun', rdv: 4 },
                { name: 'Mar', rdv: 7 },
                { name: 'Mer', rdv: 5 },
                { name: 'Jeu', rdv: 8 },
                { name: 'Ven', rdv: 6 },
                { name: 'Sam', rdv: 3 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="rdv" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Demographics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Répartition Patients</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm text-gray-600 mt-2">
            <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div> H</span>
            <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-pink-500 mr-1"></div> F</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;