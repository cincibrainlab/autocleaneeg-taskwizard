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

interface Step5Props {
  currentTaskName: string;
  currentTaskData: TaskData;
  handleInputChange: (path: string, value: any) => void;
  errors: ValidationErrors;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
}

const Step5ResampleReref: React.FC<Step5Props> = ({ 
  currentTaskName, 
  currentTaskData, 
  handleInputChange, 
  errors, 
  goToPreviousStep, 
  goToNextStep 
}) => {
  // Ensure data exists before rendering
  if (!currentTaskData.settings) return null; 
  const resampleSettings = currentTaskData.settings.resample_step;
  const referenceSettings = currentTaskData.settings.reference_step;

  return (
    <Card className="border-t-4 border-t-rose-500 shadow-md overflow-hidden">
        <CardHeader className="mx-1 mt-1 mb-0 rounded-lg bg-gradient-to-r from-rose-50 to-red-50 pt-4 pb-4">
            <CardTitle>Step 4: Resample & Rereference</CardTitle> 
            <CardDescription>Configure data resampling and rereferencing options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6">
                    {resampleSettings && (
                        <motion.div className="space-y-4" layout>
                            <button
                                type="button"
                                onClick={() => handleInputChange(`tasks.${currentTaskName}.settings.resample_step.enabled`, !resampleSettings.enabled)}
                                className="flex items-center justify-between w-full p-3 border rounded-md hover:border-rose-200 hover:bg-rose-50/30 transition-colors"
                            >
                                <div className="flex-1 flex items-center space-x-3">
                                    <div className={`
                                        flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                        ${resampleSettings.enabled ? 'bg-rose-500 border-rose-600' : 'border-input'}
                                    `}>
                                        {resampleSettings.enabled && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <Label className="font-medium">{formatStepKey("resample_step")}</Label>
                                        <p className="text-sm text-muted-foreground">Downsample the data to reduce file size and processing time.</p>
                                    </div>
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {resampleSettings.enabled && (
                                    <motion.div 
                                        key="resample-content"
                                        className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-rose-200 ml-2.5 overflow-hidden"
                                        initial={sectionAnimation.initial}
                                        animate={sectionAnimation.animate}
                                        exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }} 
                                        transition={sectionAnimation.transition}
                                    >
                                        <FormField
                                            path={`tasks.${currentTaskName}.settings.resample_step.value`}
                                            label="Sampling Rate (Hz)"
                                            tooltip="Target sampling rate in Hz (e.g., 250 for 250Hz)"
                                            value={resampleSettings.value}
                                            onChange={handleInputChange}
                                            error={errors[`tasks.${currentTaskName}.settings.resample_step.value`]}
                                            type="number"
                                            placeholder="e.g., 250"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                    
                    {referenceSettings && (
                        <motion.div className="space-y-4" layout>
                            <button
                                type="button"
                                onClick={() => handleInputChange(`tasks.${currentTaskName}.settings.reference_step.enabled`, !referenceSettings.enabled)}
                                className="flex items-center justify-between w-full p-3 border rounded-md hover:border-rose-200 hover:bg-rose-50/30 transition-colors"
                            >
                                <div className="flex-1 flex items-center space-x-3">
                                    <div className={`
                                        flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                        ${referenceSettings.enabled ? 'bg-rose-500 border-rose-600' : 'border-input'}
                                    `}>
                                        {referenceSettings.enabled && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <Label className="font-medium">{formatStepKey("reference_step")}</Label>
                                        <p className="text-sm text-muted-foreground">Re-reference the data to a new reference.</p>
                                    </div>
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {referenceSettings.enabled && (
                                    <motion.div 
                                        key="reference-content"
                                        className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-rose-200 ml-2.5 overflow-hidden"
                                        initial={sectionAnimation.initial}
                                        animate={sectionAnimation.animate}
                                        exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }} 
                                        transition={sectionAnimation.transition}
                                    >
                                        <FormField
                                            path={`tasks.${currentTaskName}.settings.reference_step.value`}
                                            label="Reference Type"
                                            tooltip="Type of reference to use (e.g., average, mastoids)"
                                            value={referenceSettings.value}
                                            onChange={handleInputChange}
                                            error={errors[`tasks.${currentTaskName}.settings.reference_step.value`]}
                                            type="select"
                                            options={[
                                                { value: "average", label: "Average Reference" },
                                                { value: "mastoids", label: "Mastoids" },
                                                { value: "linked_mastoids", label: "Linked Mastoids" }
                                            ]}
                                            placeholder="Select reference type..."
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={goToPreviousStep}>Back to Filtering & Montage</Button>
                    <Button className="bg-rose-600 hover:bg-rose-700" onClick={goToNextStep}>Next: Channel Removal & Trim/Crop</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default Step5ResampleReref; 