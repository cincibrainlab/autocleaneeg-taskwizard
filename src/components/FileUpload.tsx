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
      setErrorMessage('Please select a Python configuration file (.py)');
      return;
    }

    setStatus('uploading');
    setErrorMessage('');

    try {
      const content = await file.text();
      const config = parsePythonTaskFile(content);
      
      if (!config) {
        throw new Error('Unable to parse configuration file. Please ensure it\'s a valid Autoclean EEG task file.');
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
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process configuration file');
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
        return 'Processing configuration file...';
      case 'success':
        return 'EEG configuration imported successfully!';
      case 'error':
        return errorMessage;
      default:
        return 'Import Previous EEG Configuration';
    }
  };

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-indigo-400 bg-indigo-50/50 shadow-lg'
            : status === 'error'
            ? 'border-red-300 bg-red-50/50'
            : status === 'success'
            ? 'border-emerald-300 bg-emerald-50/50'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/30'
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
        
        <div className="space-y-4">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800 mb-2">
              {getStatusText()}
            </p>
            {status === 'idle' && (
              <p className="text-sm text-slate-600 leading-relaxed">
                Drag and drop your Python task file here, or click below to browse
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
          className="w-full mt-6 border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 py-3 rounded-xl font-medium"
        >
          <Upload className="h-5 w-5 mr-3" />
          Browse Configuration Files
        </Button>
      )}
    </div>
  );
}