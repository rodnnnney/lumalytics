"use client";

import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "../components/addEvent/dropzone";
import { useEffect } from "react";

interface FileUploadDemoProps {
  onFileChange?: (hasFiles: boolean) => void;
  onFilesSelected?: (
    files: File[],
    uploadFn: (customPath?: string) => Promise<void>
  ) => void;
  bucketName?: string;
  folderPath?: string;
}

const FileUploadDemo = ({
  onFileChange,
  onFilesSelected,
  bucketName = "csvs",
  folderPath = "test",
}: FileUploadDemoProps) => {
  const props = useSupabaseUpload({
    bucketName,
    path: folderPath,
    allowedMimeTypes: ["text/csv"],
    maxFiles: 1,
    maxFileSize: 1000 * 1000 * 1, // 1 MB
  });

  useEffect(() => {
    onFileChange?.(props.files.length > 0);
    if (
      props.files.length > 0 &&
      !props.files.some((file) => file.errors.length > 0)
    ) {
      // Create a wrapper function that allows passing a custom path
      const uploadWithCustomPath = async (customPath?: string) => {
        return props.onUpload(customPath);
      };
      onFilesSelected?.(props.files, uploadWithCustomPath);
    }
  }, [props.files, onFileChange, onFilesSelected, props.onUpload]);

  return (
    <div className="w-full">
      <Dropzone {...props}>
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
    </div>
  );
};

export default FileUploadDemo;
