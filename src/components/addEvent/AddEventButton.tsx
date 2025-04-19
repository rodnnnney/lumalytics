'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import AddEventModal from './AddEventModal';

export default function AddEventButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          Add Event
        </Button>
      </div>

      <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
