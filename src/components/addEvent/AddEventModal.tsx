"use client";

import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import FileUploadDemo from "@/utils/csvUpload";
import { Loader2 } from "lucide-react";
import { csvToMeta } from "@/api/supaEdge/meta-csv";
import { csvToAttendees } from "@/api/supaEdge/main-csv";
import { supabase } from "@/lib/supabase/client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { sendErrorToast, sendSuccessToast } from "../toast/toast";
import { useCsvMetaStore } from "@/store/csvMetaStore";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  eventName: string;
  date: Date | null;
  folderPath?: string;
  csvUrl?: string;
}

interface FeedbackPopup {
  show: boolean;
  success: boolean;
  message: string;
  details?: string;
}

export default function AddEventModal({ isOpen, onClose }: AddEventModalProps) {
  const [formData, setFormData] = useState<FormData>({
    eventName: "",
    date: null,
  });

  const [hasUploadedFiles, setHasUploadedFiles] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadFn, setUploadFn] = useState<
    ((customPath?: string) => Promise<void>) | null
  >(null);
  const [feedback, setFeedback] = useState<FeedbackPopup>({
    show: false,
    success: false,
    message: "",
  });

  const { refreshCsvMeta } = useCsvMetaStore();

  const isFormValid =
    formData.eventName.trim() !== "" && formData.date !== null;

  const hasUnsavedChanges = useCallback(() => {
    return (
      formData.eventName !== "" || formData.date !== null || hasUploadedFiles
    );
  }, [formData.eventName, formData.date, hasUploadedFiles]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges()) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  const handleConfirmClose = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      date: null,
      eventName: "",
    }));
    setSelectedFiles([]);
    setHasUploadedFiles(false);
    setIsSubmitting(false);
    setUploadFn(null);
    setShowConfirmDialog(false);
    onClose();
  }, [onClose]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleDateChange = useCallback((date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      date: date,
    }));
  }, []);

  const handleFileChange = useCallback((hasFiles: boolean) => {
    setHasUploadedFiles(hasFiles);
  }, []);

  const handleFilesSelected = useCallback(
    (files: File[], uploadFunction: (customPath?: string) => Promise<void>) => {
      setSelectedFiles(files);
      setUploadFn(() => uploadFunction);
    },
    []
  );

  const handleSubmit = useCallback(
    /**
     * Handles the form submission for adding a new event.
     * - Prevents the default form submission behavior.
     * - Validates user authentication and uploads files.
     * - Generates a unique event ID and constructs the file path.
     * - Submits event metadata and attendees data to server functions.
     * - Displays success or error notifications based on the response.
     */
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!uploadFn) return;

      setIsSubmitting(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        await uploadFn(user.id);

        const eventId = crypto.randomUUID();
        const filePath = `${user.id}/${selectedFiles[0].name}`;

        const eventDate = formData.date || new Date();
        const formattedDate = eventDate.toISOString();

        console.log("Submitting event with data:", {
          bucket: "csvs",
          path: filePath,
          userid: user.id,
          eventid: eventId,
          eventname: formData.eventName,
          eventdate: formattedDate,
        });

        const [csvMetadata, csvAttendeesData] = await Promise.all([
          csvToMeta({
            bucket: "csvs",
            path: filePath,
            userid: user.id,
            eventid: eventId,
            eventname: formData.eventName,
            eventdate: formattedDate,
          }),
          csvToAttendees({
            bucket: "csvs",
            path: filePath,
            userid: user.id,
            eventid: eventId,
          }),
        ]);

        const csvMetaerror = csvMetadata.error;
        const csvAttendeesError = csvAttendeesData.error;

        if (csvMetaerror || csvAttendeesError) {
          sendErrorToast(csvMetaerror.message || csvAttendeesError.message);
          throw new Error(csvMetaerror.message || csvAttendeesError.message);
        }

        console.log("Event created successfully:", {
          eventId,
          filePath,
          csvMetadata,
          csvAttendeesData,
        });

        sendSuccessToast("Event created successfully");

        handleConfirmClose();

        await refreshCsvMeta();
      } catch (error) {
        console.error("Error creating event:", error);
        sendErrorToast(error.message);
      }
    },
    [uploadFn, selectedFiles, formData, feedback.show, refreshCsvMeta]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300" />

      <div className="relative z-50 w-full max-w-4xl rounded-lg bg-white/95 p-6 shadow-xl transition-all duration-300">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New Event</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
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
                selected={formData.date}
                onChange={handleDateChange}
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

          <div className="w-full">
            <FileUploadDemo
              onFileChange={handleFileChange}
              onFilesSelected={handleFilesSelected}
              bucketName="csvs"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-gray-300"
              type="button"
            >
              Cancel
            </Button>
            <Button
              disabled={
                !isFormValid || !hasUploadedFiles || !uploadFn || isSubmitting
              }
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Event...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative z-[70] w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Confirm Close</h3>
            <p className="mb-6 text-gray-600">
              You have unsaved changes
              {hasUploadedFiles ? " (including uploaded files)" : ""}. Are you
              sure you want to close? Your progress will be lost.
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
      )}
    </div>
  );
}
