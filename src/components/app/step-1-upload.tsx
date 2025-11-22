'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';

interface Step1UploadProps {
  onFileSelect: (file: File, dataUri: string) => void;
  onUpload: () => void;
  isLoading: boolean;
  selectedFile: File | null;
}

export default function Step1Upload({ onFileSelect, onUpload, isLoading, selectedFile }: Step1UploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        onFileSelect(file, dataUri);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/xml': ['.xml'],
      'text/markdown': ['.md', '.markdown'],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    onFileSelect(null as any, '');
  }

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Upload Requirements Document</CardTitle>
        <CardDescription>
          Start by uploading your software requirements document. Supported formats: PDF, DOCX, XML, MD.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedFile ? (
            <div className="flex items-center justify-between rounded-lg border border-dashed p-4">
                <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-primary" />
                    <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} disabled={isLoading}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 text-center transition-colors hover:border-primary/50 ${isDragActive ? 'border-primary bg-primary/10' : ''}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="font-medium">
              {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select a file'}
            </p>
            <p className="text-sm text-muted-foreground">Maximum file size 10MB</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onUpload} disabled={!selectedFile || isLoading} className="ml-auto">
          {isLoading ? <LoadingSpinner /> : 'Parse Document'}
          <span className="sr-only">Parse Document</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
