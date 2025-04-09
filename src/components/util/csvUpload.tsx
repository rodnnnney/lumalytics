"use client";

import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "../addEvent/dropzone";
import { useEffect } from "react";

interface FileUploadDemoProps {
  onFileChange?: (hasFiles: boolean) => void;
  onFilesSelected?: (files: File[], uploadFn: () => Promise<void>) => void;
}

const FileUploadDemo = ({
  onFileChange,
  onFilesSelected,
}: FileUploadDemoProps) => {
  const props = useSupabaseUpload({
    bucketName: "csvs",
    path: "test",
    allowedMimeTypes: ["text/csv"],
    maxFiles: 1,
    maxFileSize: 1000 * 1000 * 10, // 10MB
  });

  useEffect(() => {
    onFileChange?.(props.files.length > 0);
    if (
      props.files.length > 0 &&
      !props.files.some((file) => file.errors.length > 0)
    ) {
      onFilesSelected?.(props.files, props.onUpload);
    }
  }, [props.files, onFileChange, onFilesSelected]);

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
