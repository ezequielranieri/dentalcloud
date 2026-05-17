'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, Code } from 'lucide-react';

const navItems = [
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex flex-col z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-150
                ${isActive ? 'text-blue-600' : 'text-gray-500'}
              `}
            >
              <Icon size={20} />
              <span className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      
      <div className="flex justify-center pb-2 pt-0.5">
        <a 
          href="https://github.com/ezequielranieri" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[9px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Code size={10} />
          <span>Desarrollado por Ezequiel Ranieri</span>
        </a>
      </div>
      <div className="h-safe-bottom" />
    </nav>
  );
}
