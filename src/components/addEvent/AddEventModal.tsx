"use client";

import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import FileUploadDemo from "../util/csvUpload";
import { Loader2 } from "lucide-react";
import supabase from "@/lib/supa/supa";
import metaToCsv from "@/api/supaEdge/meta-csv";
import { fetchCsvAttendees } from "@/api/supaEdge/main-csv";
import { CsvMetaPayload } from "@/types/payloads";
import { env } from "process";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  eventName: string;
  date: string;
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
    date: "",
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

  const isFormValid = formData.eventName.trim() !== "" && formData.date !== "";

  const hasUnsavedChanges = useCallback(() => {
    return (
      formData.eventName !== "" || formData.date !== "" || hasUploadedFiles
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
      date: "",
      eventName: "",
    }));
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

  const closeFeedback = useCallback(() => {
    setFeedback((prev) => ({ ...prev, show: false }));
  }, []);

  const importTable = async (payload: CsvAttendeesPayload) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("No authentication token available - please log in");
    }

    const { data, error } = await supabase.functions.invoke("csv-attendees", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: payload,
    });

    return { data, error };
  };

  const handleSubmit = useCallback(
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

        const folderPath = `${user.id}/${formData.eventName || "untitled"}`;
        await uploadFn(user.id);

        const fileName = selectedFiles[0].name;
        const eventId = crypto.randomUUID();
        const filePath = `${folderPath}/${fileName}`;

        // const response = await metaToCsv(
        //   "csvs",
        //   filePath,
        //   user.id,
        //   eventId,
        //   formData.eventName,
        //   formData.date
        // );

        const { data, error } = await importTable({
          bucket: "csvs", // ✅ match your upload bucket
          path: `${user.id}/${selectedFiles[0].name}`, // ✅ match your upload path
          userid: user.id,
          eventid: eventId,
        });

        if (error) {
          throw new Error(error.message);
        }

        // try {
        //   const csvResponse = await fetchCsvAttendees({
        //     bucket: "csvs",
        //     path: filePath,
        //     userid: user.id,
        //     eventid: eventId,
        //   });

        //   if (csvResponse.error) {
        //     throw new Error(csvResponse.error || "Failed to process CSV");
        //   }
        // } catch (csvError) {
        //   console.error("Error processing CSV:", csvError);
        //   setFeedback({
        //     show: true,
        //     success: false,
        //     message: "Error processing CSV",
        //     details:
        //       csvError instanceof Error ? csvError.message : String(csvError),
        //   });
        //   throw csvError;
        // }

        // if (response.error) {
        //   setFeedback({
        //     show: true,
        //     success: false,
        //     message: "Error creating event",
        //     details: response.error,
        //   });
        //   throw new Error(response.error);
        // }

        setFeedback({
          show: true,
          success: true,
          message: "Event created successfully",
          details: `Event ID: ${eventId}, File: ${fileName}`,
        });
      } catch (error) {
        console.error("Error creating event:", error);
        if (!feedback.show) {
          setFeedback({
            show: true,
            success: false,
            message: "Error creating event",
            details: error instanceof Error ? error.message : String(error),
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [uploadFn, selectedFiles, formData, feedback.show]
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (feedback.show && feedback.success) {
      timeoutId = setTimeout(() => {
        setFeedback((prev) => ({ ...prev, show: false }));
        onClose();
      }, 10000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [feedback.show, feedback.success, onClose]);

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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
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

      {feedback.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeFeedback}
          />
          <div className="relative z-[70] w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              {feedback.success ? (
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-medium text-gray-900">
                {feedback.success ? "Success" : "Error"}
              </h3>
              <button
                onClick={closeFeedback}
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900 mb-2">
                {feedback.message}
              </p>
              {feedback.details && (
                <div className="mt-2 rounded-md bg-gray-50 p-4 text-sm text-gray-600 font-mono overflow-auto max-h-40 border border-gray-200">
                  {feedback.details}
                </div>
              )}
            </div>

            <div className="mt-5">
              <Button
                onClick={closeFeedback}
                className={`w-full justify-center ${
                  feedback.success
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {feedback.success ? "Done" : "Try Again"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
