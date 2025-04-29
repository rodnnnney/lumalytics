'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ClockIcon, UsersIcon, CogIcon } from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Events', href: '/past', icon: ClockIcon },
  { name: 'Attendees', href: '/users', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white text-black shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out">
      <div className="flex flex-col h-28 px-6 border-b border-gray-100 py-4">
        <span className="absolute top-0 left-0 p-6 inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-2xl font-bold text-transparent">
          Lumalytics
        </span>
      </div>
      <nav className="mt-8 px-2">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3.5 my-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#7195e8]/5 to-[#f27676]/5 p-4 shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <item.icon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              <span>{item.name}</span>
              {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-gray-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="rounded-lg bg-gradient-to-r from-[#7195e8]/5 to-[#f27676]/5 p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-600 mb-2">Dashboard Version</p>
          <p className="text-sm font-bold text-gray-800">v1.0 (Beta)</p>
        </div>
      </div>
    </div>
  );
}
