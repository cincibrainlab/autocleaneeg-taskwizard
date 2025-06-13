import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parsePythonTaskFile, validateParsedConfig } from '@/lib/pythonParser';
import type { ConfigType } from '@/lib/types';

interface FileUploadProps {
  onConfigLoaded: (config: ConfigType) => void;
  className?: string;
}

export function FileUpload({ onConfigLoaded, className = '' }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.py')) {
      setStatus('error');
      setErrorMessage('Please upload a Python (.py) file');
      return;
    }

    setStatus('uploading');
    setErrorMessage('');

    try {
      const content = await file.text();
      const config = parsePythonTaskFile(content);
      
      if (!config) {
        throw new Error('Could not parse the Python file. Please make sure it\'s a valid autoclean task file.');
      }

      const validation = validateParsedConfig(config);
      if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      setStatus('success');
      onConfigLoaded(config);
      
      // Reset status after a short delay
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-8 w-8 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <FileText className="h-8 w-8" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Processing file...';
      case 'success':
        return 'Configuration loaded successfully!';
      case 'error':
        return errorMessage;
      default:
        return 'Upload existing task file to edit';
    }
  };

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : status === 'error'
            ? 'border-red-300 bg-red-50'
            : status === 'success'
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".py"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-2">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium">
              {getStatusText()}
            </p>
            {status === 'idle' && (
              <p className="text-xs text-gray-500 mt-1">
                Drag and drop a .py file here, or click to browse
              </p>
            )}
          </div>
        </div>
      </div>
      
      {status === 'idle' && (
        <Button
          type="button"
          variant="outline"
          onClick={onButtonClick}
          className="w-full mt-2"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose File
        </Button>
      )}
    </div>
  );
}