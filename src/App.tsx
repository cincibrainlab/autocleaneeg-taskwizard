import React, { useState, useCallback, useEffect } from 'react'
import { saveAs } from 'file-saver'
import { Check } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'

// Import shadcn/ui components
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Import local components
import FormField from './components/FormField'
import RejectionPolicySection from './components/RejectionPolicySection' // RejectionPolicySection still used in Step 9
import BrainIcon from './components/BrainIcon'
import { FileUpload } from './components/FileUpload'
import { montageOptions } from './lib/constants'; // Import the constant

// --- Import Step Components ---
import Step4Montage from './components/steps/Step4Montage'
import Step5ResampleReref from './components/steps/Step5ResampleReref'
import Step6TrimCrop from './components/steps/Step6TrimCrop'
import Step7EogChannels from './components/steps/Step7EogChannels'
import Step7ICA from './components/steps/Step7ICA'
import Step8Epochs from './components/steps/Step8Epochs'
import Step9Configure from './components/steps/Step9Configure'


// Import types from the new file
import type { ConfigType, TaskData, ValidationErrors } from './lib/types';

// Import templates from the new file
import { defaultTaskSettings, taskTemplates } from './lib/configTemplates';
import { deepClone } from './lib/utils'; // Import deepClone
// Moved formatStepKey here
import { formatStepKey } from './lib/utils'; 
// Import validation functions
import { validateConfig } from './lib/validation'; 
// Import file generation functions
import { generateTaskScript } from './lib/fileGeneration';

// --- Helper Functions ---

// Helper to get the first task key (since we only handle one)
export const getFirstTaskName = (tasks: Record<string, TaskData>): string | undefined => {
    return Object.keys(tasks)[0];
}

// Function to get a specific task template or default custom task
const getTaskConfig = (taskName: string | null): TaskData => {
  if (taskName && taskTemplates[taskName]) {
    return deepClone(taskTemplates[taskName]); // Use imported deepClone
  } else {
    const customTask = deepClone(defaultTaskSettings); // Use imported deepClone
    customTask.mne_task = "CustomTask";
    customTask.description = "Custom task configuration";
    return customTask;
  }
};

// Animation variants for expanding sections
// This is still needed for steps 1-7 that remain inline or use it directly
// Step 8 has its own copy for now, can be refactored later
const sectionAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

// --- Main App Component ---

function App() {
  // State for the main Autoclean config
  const [config, setConfig] = useState<ConfigType>({ tasks: {} });

  // State to manage the current step
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // State to track if initial template has been selected
  const [configFinalized, setConfigFinalized] = useState<boolean>(false);

  // Add state to track the highest step reached
  const [highestStepReached, setHighestStepReached] = useState<number>(1);

  // Derive current task name and data (memoize if performance becomes issue)
  const currentTaskName = getFirstTaskName(config.tasks);
  const currentTaskData = currentTaskName ? config.tasks[currentTaskName] : undefined;

  const [pythonPreview, setPythonPreview] = useState<string>('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loadError, setLoadError] = useState<string>('');

  // --- Navigation Handlers ---
  const goToNextStep = () => setCurrentStep(prev => {
      const nextStep = prev + 1;
      // Update highest step reached when moving forward
      setHighestStepReached(currentHighest => Math.max(currentHighest, nextStep));
      return nextStep;
  });
  
  const goToPreviousStep = () => {
      setErrors({}); 
      // Don't reset highestStepReached when going back
      setCurrentStep(prev => prev - 1);
  };

  // --- Step 1 Handler (handleStartOptionSelect) ---
  const handleStartOptionSelect = (startOptionKey: string) => {
      let taskData: TaskData;
      let finalTaskName: string;

      if (startOptionKey === 'Custom') {
          taskData = getTaskConfig(null); // getTaskConfig handles custom default
          finalTaskName = 'CustomTask'; 
      } else {
          taskData = getTaskConfig(startOptionKey);
          finalTaskName = startOptionKey;
      }

      // Set the config based on the selection
      setConfig({
          tasks: { [finalTaskName]: taskData }
      });
      
      // Clear errors, advance step, and mark config as finalized
      setErrors({});
      setLoadError('');
      setHighestStepReached(2);
      // Explicitly set step and highest reached for clarity after selection
      setCurrentStep(2);
      setConfigFinalized(true);
  };

  // --- Handler for loading uploaded configuration ---
  const handleConfigLoaded = (loadedConfig: ConfigType) => {
    setConfig(loadedConfig);
    setErrors({});
    setLoadError('');
    setHighestStepReached(9); // Allow access to all steps since config is complete
    setCurrentStep(2); // Start at task info step to review loaded config
    setConfigFinalized(true);
  };

  // Handler for main Autoclean config changes
  const handleInputChange = useCallback((path: string, value: any) => {
    setConfig(prevConfig => {
      const newConfig = deepClone(prevConfig);
      let current: any = newConfig;
      const parts = path.split('.');

      try {
        for (let i = 0; i < parts.length - 1; i++) {
          if (current[parts[i]] === undefined || current[parts[i]] === null) {
            // If a part of the path doesn't exist, we might need to create it
            // Check if we need to create nested objects like 'value' or 'window'
            if (parts[i] === 'value' && (parts[i-1] === 'epoch_settings' || parts[i-1] === 'crop_step')) {
                 current[parts[i]] = {}; // Create the 'value' object
            } else if (parts[i] === 'window' && parts[i-1] === 'remove_baseline') {
                 current[parts[i]] = [null, null]; // Create the 'window' array
            } else if (parts[i] === 'volt_threshold' && parts[i-1] === 'threshold_rejection') {
                 current[parts[i]] = {}; // Create volt_threshold object
            }
             else {
                console.error(`Invalid path segment: ${parts[i]} in path ${path}`);
                return prevConfig; // Avoid creating arbitrary objects for now
            }

          }
          current = current[parts[i]];
        }

        const finalPart = parts[parts.length - 1];
        
        // Handle array indices specifically if the final part is a number
        if (!isNaN(Number(finalPart)) && Array.isArray(current)) {
            const index = Number(finalPart);
            if (index >= 0 && index < current.length) {
                 current[index] = value;
            } else {
                console.error(`Index ${index} out of bounds for path ${path}`);
                return prevConfig;
            }
        } else {
            current[finalPart] = value;
        }


        // --- Special Handling: Task Name Change ---
        // If the `mne_task` field itself was changed
        if (parts.length === 3 && parts[0] === 'tasks' && parts[2] === 'mne_task') {
            const oldTaskName = parts[1];
            // Sanitize new task name (basic example: replace spaces)
            const newTaskName = typeof value === 'string' ? value.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') : `InvalidTaskName_${Date.now()}`;
            
            if (newTaskName && oldTaskName !== newTaskName && newConfig.tasks[oldTaskName]) {
                // Rename the task key
                const taskData = newConfig.tasks[oldTaskName];
                delete newConfig.tasks[oldTaskName];
                // Update the mne_task value within the data as well
                taskData.mne_task = value; // Use the original input value here
                newConfig.tasks[newTaskName] = taskData;
                // No need to call setCurrentTaskName, it's derived from config state
            } else if (newTaskName && oldTaskName === newTaskName) {
                // Ensure the value within the task data is also updated even if key doesn't change
                 if (newConfig.tasks[newTaskName]) {
                     newConfig.tasks[newTaskName].mne_task = value;
                 }
            }
        }

      } catch (error) {
          console.error(`Error updating config at path ${path}:`, error);
          return prevConfig; // Return previous state on error
      }

      return newConfig;
    });

    // --- Basic Live Validation ---
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      // Clear error for this specific field when it's changed
      delete newErrors[path];
      
      // Example: Required field validation (only for specific known required fields)
      if ((path.endsWith('.mne_task') || path.endsWith('.description')) && !value) {
          newErrors[path] = 'This field is required.';
      }

      // More specific validation should happen in `validateConfig` before preview/download

      return newErrors;
    });

  }, []);



  // --- Action Handlers ---

  const handlePreview = () => {
    // Validate config before previewing
    const configErrors = validateConfig(config);
    setErrors(configErrors);

    if (Object.keys(configErrors).length > 0) {
      setPythonPreview('Please fix the validation errors before previewing.');
      return;
    }

    try {
      const pythonScript = generateTaskScript(config);
      setPythonPreview(pythonScript);
    } catch (error: any) {
      console.error("Python Generation Error:", error);
      setPythonPreview(`Failed to generate Python script: ${error.message}`);
      setErrors(prev => ({ ...prev, pythonGeneration: `Failed to generate Python script: ${error.message}` }));
    }
  };

  const handleDownload = async () => {
    // Validate config
    const configErrors = validateConfig(config);
    setErrors(configErrors);

    if (Object.keys(configErrors).length > 0) {
      alert('Please fix the validation errors before downloading.');
      return;
    }

    try {
      // Generate Python task script content
      const taskScriptContent = generateTaskScript(config);
      
      // Determine filename based on task name
      const taskName = getFirstTaskName(config.tasks);
      const filename = taskName ? `${taskName.toLowerCase()}.py` : 'task.py';
      
      // Create blob and trigger download
      const blob = new Blob([taskScriptContent], { type: 'text/x-python' });
      saveAs(blob, filename);
      
      // Update preview on successful download
      setPythonPreview(taskScriptContent);

    } catch (error: any) {
      console.error("Python Generation/Download Error:", error);
      alert(`Failed to generate or download Python file: ${error.message}`);
      setErrors(prev => ({ ...prev, fileGeneration: `Failed to generate Python file: ${error.message}` }));
    }
  };

  // --- Render ---
  return (
    <TooltipProvider>
      {/* Beautiful background container */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full opacity-10 blur-3xl"></div>
        
        {/* Content container with max width and centered */}
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 bg-white/70 backdrop-blur-sm shadow-2xl border border-white/30 min-h-screen relative z-10">
        {/* Make header relative to position icon */}
        {/* Use Flexbox for alignment */}
        <header className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl p-8 mb-10 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            {/* Brand and tagline */}
            <div className="flex-1"> 
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 text-white drop-shadow-lg">
                  <BrainIcon />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">Autoclean EEG</h1>
                  <div className="text-sm font-medium text-white/70 uppercase tracking-wider">Configuration Wizard</div>
                </div>
              </div>
              <p className="text-white/90 text-lg font-medium">Create custom EEG preprocessing pipelines with ease</p>
            </div>
            
            {/* Visual accent */}
            <div className="hidden md:flex items-center justify-center w-24 h-24 bg-white/10 rounded-full backdrop-blur-sm">
              <div className="w-16 h-16 text-white/70">
                <BrainIcon />
              </div>
            </div>
          </div>
        </header>
        
        {/* Enhanced Two-Line Navigation */}
        <nav className="mb-8 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl p-6 shadow-lg">
          <div className="space-y-3">
            {/* First Row: Steps 1-5 */}
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              {/* Step 1 - Always enabled */}
              <Button 
                variant={currentStep === 1 ? "default" : "ghost"}
                size="sm"
                className={`rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 1 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                    : 'hover:bg-white/60 text-slate-700'
                }`}
                onClick={() => setCurrentStep(1)}
              >
                1. Template
              </Button>
              
              {/* Steps 2-5 */}
              {[2, 3, 4, 5].map((stepNumber) => {
                const stepLabels = ["", "", "Task Info", "Filtering", "Resample", "Trim/Crop"];
                const isStepReachable = configFinalized && stepNumber <= highestStepReached;
                return (
                  <div key={stepNumber} className="flex items-center">
                    <span className="mx-2 text-slate-400">•</span>
                    <Button 
                      variant={currentStep === stepNumber ? "default" : "ghost"}
                      size="sm"
                      className={`rounded-lg font-medium transition-all duration-200 ${
                        currentStep === stepNumber 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                          : isStepReachable 
                            ? 'hover:bg-white/60 text-slate-700' 
                            : 'text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!isStepReachable}
                      onClick={() => isStepReachable && setCurrentStep(stepNumber)} 
                    >
                      {`${stepNumber}. ${stepLabels[stepNumber]}`}
                    </Button>
                  </div>
                );
              })}
            </div>
            
            {/* Second Row: Steps 6-9 */}
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              {[6, 7, 8, 9].map((stepNumber) => {
                const stepLabels = ["", "", "", "", "", "", "EOG/Channels", "ICA", "Epochs", "Preview"];
                const isStepReachable = configFinalized && stepNumber <= highestStepReached;
                return (
                  <div key={stepNumber} className="flex items-center">
                    {stepNumber === 6 ? null : <span className="mx-2 text-slate-400">•</span>}
                    <Button 
                      variant={currentStep === stepNumber ? "default" : "ghost"}
                      size="sm"
                      className={`rounded-lg font-medium transition-all duration-200 ${
                        currentStep === stepNumber 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                          : isStepReachable 
                            ? 'hover:bg-white/60 text-slate-700' 
                            : 'text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!isStepReachable}
                      onClick={() => isStepReachable && setCurrentStep(stepNumber)} 
                    >
                      {`${stepNumber}. ${stepLabels[stepNumber]}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        {/* --- Step 1: Select Starting Point --- */}
        {currentStep === 1 && (
            <div className="space-y-6">
                <Card className="border border-slate-200/50 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                     <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/50 px-8 py-6">
                         <CardTitle className="text-2xl font-bold text-slate-800">Choose Your Starting Point</CardTitle>
                         <CardDescription className="text-slate-600 text-lg">Select a common EEG task template or start with a custom configuration.</CardDescription>
                     </CardHeader>
                     <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                         {/* Button for RestingState */}
                         <Button 
                             variant="outline" 
                             className="group min-h-[160px] p-8 flex flex-col items-center justify-center space-y-4 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 w-full rounded-2xl bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50" 
                             onClick={() => handleStartOptionSelect('RestingState')}
                         >
                             <div className="w-12 h-12 rounded-full bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                               <div className="w-6 h-6 bg-indigo-600 rounded-full"></div>
                             </div>
                             <span className="text-xl font-bold text-slate-800 text-center">Resting State</span>
                             <span className="text-sm text-slate-600 text-center break-words leading-relaxed max-w-full whitespace-normal">Continuous EEG recording without specific events</span>
                         </Button>
                          {/* Button for EventBased */}
                          <Button 
                             variant="outline" 
                             className="group min-h-[160px] p-8 flex flex-col items-center justify-center space-y-4 border-2 border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 w-full rounded-2xl bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50" 
                             onClick={() => handleStartOptionSelect('EventBased')}
                         >
                             <div className="w-12 h-12 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                               <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
                             </div>
                             <span className="text-xl font-bold text-slate-800 text-center">Event-Based</span>
                             <span className="text-sm text-slate-600 text-center break-words leading-relaxed max-w-full whitespace-normal">Paradigm with stimulus triggers and event markers</span>
                         </Button>
                         {/* Button for Custom */}
                         <Button 
                             variant="outline" 
                             className="group min-h-[160px] p-8 flex flex-col items-center justify-center space-y-4 border-2 border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 w-full rounded-2xl bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50" 
                             onClick={() => handleStartOptionSelect('Custom')}
                         >
                             <div className="w-12 h-12 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
                               <div className="w-6 h-6 bg-emerald-600 rounded-full"></div>
                             </div>
                            <span className="text-xl font-bold text-slate-800 text-center">Custom</span>
                            <span className="text-sm text-slate-600 text-center break-words leading-relaxed max-w-full whitespace-normal">Start with blank configuration</span>
                         </Button>
                     </CardContent>
                </Card>
                
                {/* Upload existing task file section */}
                <Card className="border border-slate-200/50 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200/50 px-8 py-6">
                        <CardTitle className="text-2xl font-bold text-slate-800">Upload Existing Configuration</CardTitle>
                        <CardDescription className="text-slate-600 text-lg">Upload a previously generated Python task file to edit its configuration.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <FileUpload onConfigLoaded={handleConfigLoaded} />
                    </CardContent>
                </Card>
            </div>
        )}

        {/* --- Step 2: Task Information --- */}
        {currentStep === 2 && currentTaskName && currentTaskData && (
            <Card className="border border-slate-200/50 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-200/50 px-8 py-6">
                    <CardTitle className="text-2xl font-bold text-slate-800">Task Information</CardTitle>
                    <CardDescription className="text-slate-600 text-lg">Define the basic identifiers for your EEG processing task.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                     {/* Task Metadata Section */}
                     <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            path={`tasks.${currentTaskName}.mne_task`}
                            label="Task Name"
                            tooltip="Internal identifier for this task used by Pipeline (no spaces recommended). Changing this renames the task."
                            value={currentTaskData.mne_task}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.mne_task`]}
                            type="text"
                            placeholder="e.g., RestingEyesOpen"
                        />
                        <FormField
                            path={`tasks.${currentTaskName}.description`}
                            label="Description"
                            tooltip="A brief description of this task configuration."
                            value={currentTaskData.description}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.description`]}
                            type="textarea"
                            placeholder="e.g., Standard resting state analysis"
                        />
                     </div>
                     {/* Navigation Buttons */}
                     <div className="flex justify-between mt-6">
                         <Button variant="outline" onClick={goToPreviousStep}>Back to Template</Button>
                         <Button className="bg-purple-600 hover:bg-purple-700" onClick={goToNextStep}>Next: Montage</Button> 
                     </div>
                </CardContent>
            </Card>
        )}
        

        {/* --- Step 3: Montage --- */} 
        {currentStep === 3 && currentTaskName && currentTaskData && (
            <Step4Montage 
                currentTaskName={currentTaskName}
                currentTaskData={currentTaskData}
                handleInputChange={handleInputChange}
                errors={errors}
                goToPreviousStep={goToPreviousStep}
                goToNextStep={goToNextStep}
            />
        )}
        
        {/* --- Step 4: Resample & Rereference --- */}
        {currentStep === 4 && currentTaskName && currentTaskData && (
            <Step5ResampleReref
                currentTaskName={currentTaskName}
                currentTaskData={currentTaskData}
                handleInputChange={handleInputChange}
                errors={errors}
                goToPreviousStep={goToPreviousStep}
                goToNextStep={goToNextStep}
            />
        )}
        
        {/* --- Step 5: Trim and Crop --- */}
        {currentStep === 5 && currentTaskName && currentTaskData && (
            <Step6TrimCrop
                currentTaskName={currentTaskName}
                currentTaskData={currentTaskData}
                handleInputChange={handleInputChange}
                errors={errors}
                goToPreviousStep={goToPreviousStep}
                goToNextStep={goToNextStep}
            />
        )}
        
        {/* --- Step 6: EOG and Channel Pruning --- */}
        {currentStep === 6 && currentTaskName && currentTaskData && (
            <Step7EogChannels
                currentTaskName={currentTaskName}
                currentTaskData={currentTaskData}
                handleInputChange={handleInputChange}
                errors={errors}
                goToPreviousStep={goToPreviousStep}
                goToNextStep={goToNextStep}
            />
        )}
        
        {/* --- Step 7: ICA & Component Labeling --- */}
        {currentStep === 7 && currentTaskName && currentTaskData && (
            <Step7ICA
                currentTaskName={currentTaskName}
                currentTaskData={currentTaskData}
                handleInputChange={handleInputChange}
                errors={errors}
                goToPreviousStep={goToPreviousStep}
                goToNextStep={goToNextStep}
            />
        )}
        
        {/* --- Step 8: Epoch Settings --- */}
        {currentStep === 8 && currentTaskName && currentTaskData && (
            <Step8Epochs
                currentTaskName={currentTaskName}
                taskData={currentTaskData}
                handleInputChange={handleInputChange}
                errors={errors}
                goToPreviousStep={goToPreviousStep}
                goToNextStep={goToNextStep}
            />
        )}
        
        {/* --- Step 9: Preview & Download --- */}
        {currentStep === 9 && currentTaskName && currentTaskData && (
             <Step9Configure
                currentTaskName={currentTaskName}
                taskData={currentTaskData}
                handleInputChange={handleInputChange}
                errors={errors}
                pythonPreview={pythonPreview}
                handlePreview={handlePreview}
                handleDownload={handleDownload}
                goToPreviousStep={goToPreviousStep}
             />
        )}

        {/* Fallback/Error case if step/data mismatch */}
        {currentStep > 1 && (!currentTaskName || !currentTaskData) && (
             <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Configuration data is missing unexpectedly. Please go back and select a starting point.</AlertDescription>
                <div className="mt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>Back to Start</Button>
                </div>
            </Alert>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200/50 flex flex-col items-center justify-center text-sm text-slate-500">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-slate-700">Autoclean EEG</span>
            <span className="text-slate-400">•</span>
            <span>Developed with ❤️ for EEG Research</span>
          </div>
          <a 
            href="https://github.com/cincibrainlab/autoclean_pipeline" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {/* Custom organization logo placeholder */}
            <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              <img src="./cincibrainlab.png" alt="Cincinnati Children's Hospital Medical Center" className="w-full h-full rounded-sm object-contain" />
            </div>
            <span>GitHub Repository</span>
          </a>
          <p className="mt-2 text-xs text-muted-foreground/70">© {new Date().getFullYear()} Cincinnati Children's Hospital Medical Center</p>
        </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
