import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload | Lumalytics',
  description: 'A lightweight analytics platform for Luma Hosts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gray-100  h-[90vh]">
      <main className="min-h-screen">
        <div className="p-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
