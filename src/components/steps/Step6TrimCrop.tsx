import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import FormField from '../FormField'; 
import type { TaskData, ValidationErrors } from '@/lib/types';
import { formatStepKey } from '@/lib/utils'; 

// Animation settings
const sectionAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

interface Step6Props {
  currentTaskName: string;
  currentTaskData: TaskData;
  handleInputChange: (path: string, value: any) => void;
  errors: ValidationErrors;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
}

const Step6TrimCrop: React.FC<Step6Props> = ({ 
  currentTaskName, 
  currentTaskData, 
  handleInputChange, 
  errors, 
  goToPreviousStep, 
  goToNextStep 
}) => {
  // Ensure data exists before rendering
  if (!currentTaskData.settings) return null; 
  const trimSettings = currentTaskData.settings.trim_step;
  const cropSettings = currentTaskData.settings.crop_step;

  return (
    <Card className="border-t-4 border-t-orange-500 shadow-md overflow-hidden">
        <CardHeader className="mx-1 mt-1 mb-0 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 pt-4 pb-4">
            <CardTitle>Step 5: Trim and Crop</CardTitle> 
            <CardDescription>Configure data trimming and cropping options.</CardDescription>
        </CardHeader>
         <CardContent className="space-y-6 pt-6">
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6">
                    {trimSettings && (
                        <motion.div className="space-y-4" layout>
                            <button
                                type="button"
                                onClick={() => handleInputChange(`tasks.${currentTaskName}.settings.trim_step.enabled`, !trimSettings.enabled)}
                                className="flex items-center justify-between w-full p-3 border rounded-md hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
                            >
                                <div className="flex-1 flex items-center space-x-3">
                                    <div className={`
                                        flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                        ${trimSettings.enabled ? 'bg-orange-500 border-orange-600' : 'border-input'}
                                    `}>
                                        {trimSettings.enabled && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <Label className="font-medium">{formatStepKey("trim_step")}</Label>
                                        <p className="text-sm text-muted-foreground">Trim data edges to remove artifacts at recording boundaries.</p>
                                    </div>
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {trimSettings.enabled && (
                                    <motion.div 
                                        key="trim-content"
                                        className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-orange-200 ml-2.5 overflow-hidden"
                                        initial={sectionAnimation.initial}
                                        animate={sectionAnimation.animate}
                                        exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }} 
                                        transition={sectionAnimation.transition}
                                    >
                                        <FormField
                                            path={`tasks.${currentTaskName}.settings.trim_step.value`}
                                            label="Trim Duration (seconds)"
                                            tooltip="Duration in seconds to trim from the beginning and end of the recording"
                                            value={trimSettings.value}
                                            onChange={handleInputChange}
                                            error={errors[`tasks.${currentTaskName}.settings.trim_step.value`]}
                                            type="number"
                                            placeholder="e.g., 4"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                    
                    {cropSettings && (
                        <motion.div className="space-y-4" layout>
                            <button
                                type="button"
                                onClick={() => handleInputChange(`tasks.${currentTaskName}.settings.crop_step.enabled`, !cropSettings.enabled)}
                                className="flex items-center justify-between w-full p-3 border rounded-md hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
                            >
                                <div className="flex-1 flex items-center space-x-3">
                                    <div className={`
                                        flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                        ${cropSettings.enabled ? 'bg-orange-500 border-orange-600' : 'border-input'}
                                    `}>
                                        {cropSettings.enabled && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <Label className="font-medium">{formatStepKey("crop_step")}</Label>
                                        <p className="text-sm text-muted-foreground">Crop data to a specific time range.</p>
                                    </div>
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {cropSettings.enabled && (
                                    <motion.div 
                                        key="crop-content"
                                        className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-orange-200 ml-2.5 overflow-hidden"
                                        initial={sectionAnimation.initial}
                                        animate={sectionAnimation.animate}
                                        exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }} 
                                        transition={sectionAnimation.transition}
                                    >
                                        <Label className='font-medium mb-2 block pl-1'>Crop Values</Label> 
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                path={`tasks.${currentTaskName}.settings.crop_step.value.start`}
                                                label="Start Time (seconds)"
                                                tooltip="Start time in seconds (0 = beginning of recording)"
                                                value={cropSettings.value.start}
                                                onChange={handleInputChange}
                                                error={errors[`tasks.${currentTaskName}.settings.crop_step.value.start`]}
                                                type="number"
                                                placeholder="e.g., 0"
                                            />
                                            <FormField
                                                path={`tasks.${currentTaskName}.settings.crop_step.value.end`}
                                                label="End Time (seconds)"
                                                tooltip="End time in seconds (null = end of recording)"
                                                value={cropSettings.value.end}
                                                onChange={handleInputChange}
                                                error={errors[`tasks.${currentTaskName}.settings.crop_step.value.end`]}
                                                type="number"
                                                placeholder="e.g., 100 (or leave empty for end)"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={goToPreviousStep}>Back to Resample & Rereference</Button>
                    <Button className="bg-orange-600 hover:bg-orange-700" onClick={goToNextStep}>Next: EOG & Channels</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default Step6TrimCrop; 