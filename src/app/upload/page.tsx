'use client';

import { Button } from '@/components/ui/button';
import { formatBytes } from '@/utils/format';
import { shortenString } from '@/utils/shorten';

import { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';

export default function Upload() {
  interface UploadItem {
    eventName: string;
    eventDate: string;
    file: string;
  }

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [event_name, setEventName] = useState('');
  const [event_date, setEventDate] = useState('');
  const [file, setFile] = useState<File>(new File([''], ''));
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 1;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event || !event.target || !event.target.files) {
      console.error('Invalid event object in handleFileChange:', event);
      return;
    }

    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        if (event.target) {
          event.target.value = '';
        }
        setFile(new File([''], ''));
        setImagePreviewUrl('');
        return;
      }

      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(previewUrl);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddEvent = () => {
    setIsModalOpen(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      const allowedExtension = '.csv';
      const fileName = droppedFile.name.toLowerCase();

      if (fileName.endsWith(allowedExtension)) {
        setFile(droppedFile);

        // Create a preview URL for the CSV file
        const previewUrl = URL.createObjectURL(droppedFile);
        setImagePreviewUrl(previewUrl);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const createUploadItem = (upload: UploadItem) => {
    setUploadItems([...uploadItems, upload]);
  };

  const handleDivClick = () => {
    fileInputRef.current?.click();
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
            </div>

            <form className="space-y-4" onSubmit={() => {}}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={event_name}
                  onChange={e => setEventName(e.target.value)}
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
                    selected={event_date ? new Date(event_date) : null}
                    onChange={(date: Date | null) => setEventDate(date ? date.toISOString() : '')}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                    placeholderText="Select date and time"
                    wrapperClassName="w-full"
                    value={event_date}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                    CSV Upload <span className="text-red-500">*</span>
                  </label>

                  <div
                    className={`flex items-center  justify-center border-2 border-dotted ${dragActive ? 'border-luma-blue' : 'border-jkl-brown'} bg-jkl-dbeige rounded-lg py-3 sm:py-10 px-4 py-12 sm:px-10 md:px-14 lg:px-18 relative ${isUploading ? 'pointer-events-none' : ''} max-h-[75vh] sm:max-h-none overflow-hidden`}
                    onDragEnter={!isUploading ? handleDragEnter : undefined}
                    onDragOver={!isUploading ? handleDragOver : undefined}
                    onDragLeave={!isUploading ? handleDragLeave : undefined}
                    onDrop={!isUploading ? handleDrop : undefined}
                    onClick={handleDivClick}
                  >
                    {file.name !== '' ? (
                      <div className="text-center">
                        <div className="flex flex-row items-center justify-center space-x-24">
                          <div className="flex items-center">
                            <svg
                              className="h-6 w-6 text-gray-400 mr-2"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <div>
                              <p className="font-medium text-gray-900 hover:text-gray-600">
                                {shortenString(file.name, 20)}
                              </p>
                              <p className="text-left text-xs text-gray-500">
                                {formatBytes(file.size)}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setFile(new File([''], ''))}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 015.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="mt-4 flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-luma-blue"
                          >
                            <span>Upload a file</span>
                            <input
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".csv"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">CSV up to 1MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() =>
                    createUploadItem({
                      eventName: event_name,
                      eventDate: event_date,
                      file: file.name,
                    })
                  }
                >
                  Create Event
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
