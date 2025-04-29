'use client';

import { Button } from '@/components/ui/button';
import { formatBytes } from '@/utils/format';
import { shortenString } from '@/utils/shorten';
import { uploadFile } from '@/utils/supabase/upload';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { csvToMeta } from '@/api/supaEdge/meta-csv';
import { useQueryClient } from '@tanstack/react-query';

export interface UploadItem {
  eventName: string;
  eventDate: string;
  file: File;
}

export default function Upload() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [event_name, setEventName] = useState('');
  const [event_date, setEventDate] = useState('');
  const [file, setFile] = useState<File>(new File([''], ''));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingIndex, setEditingIndex] = useState<number>();
  const [deleteItem, setDeleteItem] = useState<UploadItem>();

  const [confirmUploadToDb, setConfirmUploadToDb] = useState(false);

  const [confirmHome, setConfirmHome] = useState(false);

  const { user } = useAuth();

  const router = useRouter();

  const queryClient = useQueryClient();

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

        return;
      }

      setFile(selectedFile);
    }
  };

  const handleModalClose = () => {
    if (file.name !== '' || event_name !== '' || event_date !== '') {
      setConfirmClose(true);
    } else {
      setIsModalOpen(false);
      clear();
    }
  };

  const handleAddEvent = () => {
    setIsModalOpen(true);
    setModalMode('create');
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
      const droppedFile = files[0]; // Get ONLY the first csv
      const allowedExtension = '.csv';
      const fileName = droppedFile.name.toLowerCase();

      if (fileName.endsWith(allowedExtension)) {
        setFile(droppedFile);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  // const checkData = () => {
  //   console.log(uploadItems);
  // };

  const handleConfirmClose = () => {
    clear();
    setConfirmClose(false);
  };

  const clear = () => {
    setFile(new File([''], ''));

    setEventName('');
    setEventDate('');
    setIsModalOpen(false);
  };

  const createUploadItem = (upload: UploadItem) => {
    setUploadItems([...uploadItems, upload]);
    clear();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (modalMode === 'create') {
      const isDuplicate = uploadItems.some(
        item => item.eventName === event_name || item.file.name === file.name
      );
      if (isDuplicate) {
        return;
      }

      // createUploadItem already calls clear() internally
      createUploadItem({
        eventName: event_name,
        eventDate: event_date,
        file: file,
      });
    } else {
      // Ensure editingIndex is a valid number before proceeding
      if (
        typeof editingIndex === 'number' &&
        editingIndex >= 0 &&
        editingIndex < uploadItems.length
      ) {
        const originalItem = uploadItems[editingIndex];

        // Check if any relevant fields have changed
        const nameChanged = event_name !== originalItem.eventName;
        const dateChanged = event_date !== originalItem.eventDate;
        // Check if a new file has been selected and it's different from the original
        const fileChanged = file && file !== originalItem.file;
        const hasChanged = nameChanged || dateChanged || fileChanged;

        if (hasChanged) {
          // Only update if something actually changed
          const updated: UploadItem = {
            eventName: event_name,
            eventDate: event_date,
            // Use the new file if provided, otherwise keep the original
            file: file || originalItem.file,
          };
          const updatedItems = [...uploadItems];
          updatedItems[editingIndex] = updated; // Use validated editingIndex
          setUploadItems(updatedItems);

          clear();
        } else {
          // If no changes were made, just close the modal without clearing
          setIsModalOpen(false);
        }
      } else {
        // If editingIndex is invalid, just close the modal
        setIsModalOpen(false);
      }
    }
  };

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  const editItem = (item: UploadItem, index: number) => {
    setEventName(item.eventName);
    setEventDate(item.eventDate);
    setFile(item.file);
    setIsModalOpen(true);
    setEditingIndex(index);
    setModalMode('edit');
  };

  const handleDelete = (item: UploadItem) => {
    setUploadItems(uploadItems.filter(upload => upload !== item));
    setConfirmDelete(false);
    setDeleteItem(undefined);
  };

  const deleteToggle = (item: UploadItem) => {
    setConfirmDelete(true);
    setDeleteItem(item);
  };

  const uploadToDb = async () => {
    setIsUploading(true);
    console.log('[INFO] - Initializing upload to DB');

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const id = user?.id;

    try {
      for (const upload of uploadItems) {
        const eventId = crypto.randomUUID();
        const filePath = `${id}/${upload.file.name}`;
        const formattedDate = upload.eventDate;
        console.log('Submitting event with data:', {
          bucket: 'csvs',
          path: filePath,
          userid: id,
          eventid: eventId,
          eventname: upload.eventName,
          eventdate: formattedDate,
        });
        try {
          await uploadFile(upload, id);
          console.log('✅-File uploaded successfully:');
        } catch (e) {
          console.error(`No duplicate uploads allowed ${e}`);
          return;
        }
        const { data, error } = await csvToMeta({
          bucket: 'csvs',
          path: filePath,
          userid: id,
          eventid: eventId,
          eventname: upload.eventName,
          eventdate: formattedDate,
        });
        if (error) {
          console.error('Failed to submit event metadata:', error);
          continue;
        }
        console.log('Event metadata:', data);
      }
      clear();
      setUploadItems([]);
    } catch (error) {
      console.error(`[ERROR] - Failed to process upload ${error}`);
    } finally {
      setIsUploading(false);
      router.push('/dashboard');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['userAnalytics', id] }),
        queryClient.invalidateQueries({ queryKey: ['settings', id] }),
        queryClient.invalidateQueries({ queryKey: ['csvMeta', id] }),
        queryClient.invalidateQueries({ queryKey: ['users', id] }),
      ]);
    }
  };

  const handleHome = () => {
    if (uploadItems.length > 0) {
      setConfirmHome(true);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-4">
        <p className="p-12 inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-2xl font-bold text-transparent">
          Upload
        </p>

        <div className="flex space-x-4 pr-4">
          <div className="px-4 py-2 bg-white rounded-xl border" onClick={handleHome}>
            <Button>Home</Button>
          </div>

          <div className="px-4 py-2 bg-white rounded-xl border" onClick={handleAddEvent}>
            <Button>Create New Event</Button>
          </div>

          {uploadItems.length > 0 ? (
            <div
              className="px-4 py-2 rounded-xl border bg-luma-blue text-white"
              onClick={() => setConfirmUploadToDb(true)}
            >
              <Button>Upload All Events</Button>
            </div>
          ) : (
            <div className="px-4 py-2 bg-white rounded-xl border opacity-50 cursor-not-allowed">
              <Button disabled className="pointer-events-none">
                Upload All Events
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className=" w=full "></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-12">
        {uploadItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold text-lg">{shortenString(item.eventName, 40)}</h3>
              <p className="text-sm text-gray-500">{formatBytes(item.file.size)}</p>
              <p className="text-gray-500">{shortenString(item.file.name, 15)}</p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => editItem(item, index)}
                className="p-2 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Button>

              <Button onClick={() => deleteToggle(item)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300" />

          <div className="relative z-50 w-full max-w-4xl rounded-lg bg-white/95 p-6 shadow-xl transition-all duration-300">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' ? 'Add New Event' : 'Edit Event'}
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
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
                  <input
                    type="datetime-local"
                    value={event_date}
                    onChange={e => setEventDate(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Select date and time"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
                    CSV File Upload <span className="text-red-500">*</span>
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
                                {shortenString(file?.name || '', 20)}
                              </p>
                              <p className="text-left text-xs text-gray-500">
                                {formatBytes(file?.size || 0)}
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
                            className="relative cursor-pointer rounded-md font-medium text-luma-blue after:block after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-luma-blue after:w-full after:scale-x-0 hover:after:scale-x-100 after:transition after:duration-300 after:origin-bottom-left"
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
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {modalMode === 'create' ? 'Create Event' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>

          {confirmClose && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
              <div className="relative z-[70] w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold">Confirm Close</h3>
                <p className="mb-6 text-gray-600">
                  You have unsaved changes
                  {file.name ? ' (including uploaded files)' : ''}. Are you sure you want to close?
                  Your progress will be lost.
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setConfirmClose(false)}
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
          )}
        </div>
      ) : null}

      {confirmHome ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative z-[70] w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Confirm Event Delete?</h3>
            <p className="mb-2 text-gray-600">You have unsaved changes.</p>
            <p className="mb-6 text-gray-600 font-bold">This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setConfirmDelete(false)}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setConfirmHome(false);
                  router.push('/dashboard');
                }}
                className="bg-red-500 hover:bg-luma-red text-white"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmDelete ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative z-[70] w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Confirm Event Delete?</h3>
            <p className="mb-2 text-gray-600">
              <span className="italic">{shortenString(deleteItem?.eventName || '', 20) + ` `}</span>
              will be deleted.
            </p>
            <p className="mb-6 text-gray-600 font-bold">This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setConfirmDelete(false)}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (deleteItem) {
                    handleDelete(deleteItem);
                  }
                }}
                className="bg-red-500 hover:bg-luma-red text-white"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmUploadToDb ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative z-[70] w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              {uploadItems.length === 1 ? 'Return Home?' : 'Confirm Upload Events?'}
            </h2>

            {uploadItems.map(item => (
              <div key={item.eventName}>
                <p className="text-lg font-medium">{item.eventName}</p>
                <p className="text-sm">{item.eventDate}</p>
                <p className="text-sm ">{formatBytes(item.file.size)}</p>
              </div>
            ))}
            <div className="flex justify-end space-x-3 disabled:opacity-50">
              <Button
                onClick={() => setConfirmUploadToDb(false)}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={uploadToDb}
                className="bg-luma-blue hover:bg-luma-blue text-white disabled:opacity-50 "
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="flex text-lg items-center space-x-4">
                      <p className=" text-black">Uploading</p>
                      <div className="flex items-center w-[35px]">
                        <div className="loader "></div>
                      </div>
                    </div>
                  </>
                ) : (
                  'Confirm Upload'
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
