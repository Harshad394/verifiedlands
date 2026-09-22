"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, File, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileInputProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
  error?: string;
  helperText?: string;
  value?: File[];
}

export const FileInput: React.FC<FileInputProps> = ({
  label,
  accept,
  multiple = false,
  onChange,
  error,
  helperText,
  value = [],
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>(value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const updated = multiple ? [...selectedFiles, ...newFiles] : newFiles;
      setSelectedFiles(updated);
      onChange(updated);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onChange(updated);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/50 group",
          error && "border-rose-500 bg-rose-950/20"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-2.5 rounded-full bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-800/80 transition-colors">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-300">
            Click to upload {multiple ? "files" : "file"}
          </p>
          {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
        </div>
      </div>

      {/* Selected File Previews */}
      {selectedFiles.length > 0 && (
        <ul className="space-y-2 mt-2">
          {selectedFiles.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs"
            >
              <div className="flex items-center gap-2 text-slate-200 truncate">
                <File className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile(idx)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
