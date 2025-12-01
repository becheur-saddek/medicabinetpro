import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  Menu, 
  ClipboardList,
  Stethoscope,
  LogOut
} from 'lucide-react';
import { db } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const doctorName = db.getDoctorProfile().name;

  const navItems = [
    { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/consultations', label: 'Consultations', icon: ClipboardList },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/appointments', label: 'Rendez-vous', icon: Calendar },
    { path: '/prescriptions', label: 'Ordonnances', icon: FileText },
    { path: '/settings', label: 'Paramètres', icon: Settings },
  ];

  const handleLogout = () => {
    if(confirm("Voulez-vous vous déconnecter ?")) {
      onLogout();
      // No navigation here, App.tsx handles the state change that unmounts Layout
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center h-16 px-6 bg-slate-800 border-b border-slate-700 flex-shrink-0">
          <Stethoscope className="w-8 h-8 text-teal-400 mr-3" />
          <span className="text-xl font-bold tracking-tight">MediCab Pro</span>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex-shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors mb-2"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Déconnexion</span>
          </button>
          
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
              Dr
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{doctorName.split(' ').slice(0, 2).join(' ')}</p>
              <p className="text-xs text-slate-400">En ligne</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b flex items-center px-4 justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600" />
            <span className="font-bold text-gray-800">MediCab</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;