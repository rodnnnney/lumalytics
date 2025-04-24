'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import DatePicker from 'react-datepicker';

export default function Upload() {
  interface UploadItem {
    eventName: string;
    eventDate: string;
    file: string;
  }

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddEvent = () => {
    setIsModalOpen(true);
  };

  return (
    <div>
      <h1>Upload</h1>

      <div className=" w=full "></div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300" />

          <div className="relative z-50 w-full max-w-4xl rounded-lg bg-white/95 p-6 shadow-xl transition-all duration-300">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Add New Event</h2>
              <button onClick={() => {}} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <form className="space-y-4" onSubmit={() => {}}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="eventName"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  Event Date & Time <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative w-full">
                  <DatePicker
                    //   selected={null}
                    //   onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                    placeholderText="Select date and time"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              {/* <div className="w-full">
                 <FileUploadDemo
                   onFileChange={handleFileChange}
                   onFilesSelected={handleFilesSelected}
                   bucketName="csvs"
                 />
               </div> */}

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={handleModalClose}
                  variant="outline"
                  className="border-gray-300"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  // disabled={!isFormValid || !hasUploadedFiles || !uploadFn || isSubmitting}
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {/* {isSubmitting ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Creating Event...
                     </>
                   ) : (
                     'Create Event'
                   )} */}
                </Button>
              </div>
            </form>
          </div>

          {/* {showConfirmDialog && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center">
               <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
               <div className="relative z-[70] w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                 <h3 className="mb-4 text-lg font-semibold">Confirm Close</h3>
                 <p className="mb-6 text-gray-600">
                   You have unsaved changes
                   {hasUploadedFiles ? ' (including uploaded files)' : ''}. Are you sure you want to
                   close? Your progress will be lost.
                 </p>
                 <div className="flex justify-end space-x-3">
                   <Button
                     onClick={() => setShowConfirmDialog(false)}
                     variant="outline"
                     className="border-gray-300"
                   >
                     Cancel
                   </Button>
                   <Button
                     onClick={handleConfirmClose}
                     className="bg-red-600 hover:bg-red-700 text-white"
                   >
                     Close Anyway
                   </Button>
                 </div>
               </div>
             </div>
           )} */}
        </div>
      ) : null}

      <div
        className="absolute bottom-0 right-0 right-0 p-6 bg-white rounded-12 border"
        onClick={handleAddEvent}
      >
        <Button>+</Button>
      </div>
    </div>
  );
}
