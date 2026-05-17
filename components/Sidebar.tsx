'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Users, Activity, LogOut, Code } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        setUser({
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0]
        });
      }
    });
  }, []);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      // Limpiar cualquier estado local si fuera necesario
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar redirección incluso si hay error
      window.location.href = '/login';
    }
  }

  if (pathname === '/login') return null;

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200">
      <Link href="/agenda" className="p-6 flex items-center gap-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 fill-white" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18.84,7C18.66,4.5 16.71,2.5 14.34,2.5C13,2.5 11.83,3.13 11.23,4.09C10.63,3.13 9.47,2.5 8.13,2.5C5.75,2.5 3.81,4.5 3.63,7C3.5,8.81 4.13,10.5 5.25,11.81L7,19C7,20.1 7.9,21 9,21C10.1,21 11,20.1 11,19V15H11.5V19C11.5,20.1 12.4,21 13.5,21C14.6,21 15.5,20.1 15.5,19L17.25,11.81C18.37,10.5 19,8.81 18.84,7Z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-gray-900 tracking-tight">
          Dental<span className="text-blue-600">Cloud</span>
        </span>
      </Link>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150
                ${isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs uppercase shrink-0">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate capitalize">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>

      <div className="px-6 py-4 mt-auto">
        <a 
          href="https://github.com/ezequielranieri" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Code size={12} />
          <span>Desarrollado por Ezequiel Ranieri</span>
        </a>
      </div>
    </aside>
  );
}
