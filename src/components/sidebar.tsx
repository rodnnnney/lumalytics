"use client"; // Client component for interactivity

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./ui/button";

const navItems = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  { name: "Past Events", href: "/past", icon: ClockIcon },
  { name: "Attendees", href: "/users", icon: UsersIcon },
  { name: "Settings", href: "/settings", icon: CogIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const test = () => {
    console.log("test");
  };

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white text-black shadow-[2px_0_8px_0_rgba(0,0,0,0.1)]">
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <span className="text-xl font-bold">Dashboard</span>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="w-6 h-6 mr-3" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div>
        <Button onClick={test}>
          <span>Add Event</span>
        </Button>
      </div>
    </div>
  );
}
