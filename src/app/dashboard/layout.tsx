'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gray-100">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="p-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
