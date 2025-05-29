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

interface Step7Props {
  currentTaskName: string;
  currentTaskData: TaskData;
  handleInputChange: (path: string, value: any) => void;
  errors: ValidationErrors;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
}

const Step7EogChannels: React.FC<Step7Props> = ({ 
  currentTaskName, 
  currentTaskData, 
  handleInputChange, 
  errors, 
  goToPreviousStep, 
  goToNextStep 
}) => {
  // Ensure data exists before rendering
  if (!currentTaskData.settings) return null; 
  const eogSettings = currentTaskData.settings.eog_step;
  const dropSettings = currentTaskData.settings.drop_outerlayer;

  return (
    <Card className="border-t-4 border-t-amber-500 shadow-md overflow-hidden">
        <CardHeader className="mx-1 mt-1 mb-0 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 pt-4 pb-4">
            <CardTitle>Step 7: EOG and Channel Pruning</CardTitle> 
            <CardDescription>Configure EOG detection and channel removal options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6">
                    {eogSettings && (
                        <motion.div className="space-y-4" layout>
                            <button
                                type="button"
                                onClick={() => handleInputChange(`tasks.${currentTaskName}.settings.eog_step.enabled`, !eogSettings.enabled)}
                                className="flex items-center justify-between w-full p-3 border rounded-md hover:border-amber-200 hover:bg-amber-50/30 transition-colors"
                            >
                                <div className="flex-1 flex items-center space-x-3">
                                    <div className={`
                                        flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                        ${eogSettings.enabled ? 'bg-amber-500 border-amber-600' : 'border-input'}
                                    `}>
                                        {eogSettings.enabled && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <Label className="font-medium">{formatStepKey("eog_step")}</Label>
                                        <p className="text-sm text-muted-foreground">Configure EOG (eye movement) channel detection.</p>
                                    </div>
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {eogSettings.enabled && (
                                    <motion.div 
                                        key="eog-content"
                                        className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-amber-200 ml-2.5 overflow-hidden"
                                        initial={sectionAnimation.initial}
                                        animate={sectionAnimation.animate}
                                        exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }} 
                                        transition={sectionAnimation.transition}
                                    >
                                        <FormField
                                            path={`tasks.${currentTaskName}.settings.eog_step.value`}
                                            label="EOG Parameters"
                                            tooltip="Parameters for EOG detection (format: [l_freq, h_freq, threshold] or channel names)"
                                            value={Array.isArray(eogSettings.value) 
                                                ? eogSettings.value.join(', ') 
                                                : eogSettings.value}
                                            onChange={handleInputChange}
                                            error={errors[`tasks.${currentTaskName}.settings.eog_step.value`]}
                                            type="text"
                                            placeholder="e.g., 1, 32, 8 or E1, E2"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                    
                    {dropSettings && (
                        <motion.div className="space-y-4" layout>
                            <button
                                type="button"
                                onClick={() => handleInputChange(`tasks.${currentTaskName}.settings.drop_outerlayer.enabled`, !dropSettings.enabled)}
                                className="flex items-center justify-between w-full p-3 border rounded-md hover:border-amber-200 hover:bg-amber-50/30 transition-colors"
                            >
                                <div className="flex-1 flex items-center space-x-3">
                                    <div className={`
                                        flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                        ${dropSettings.enabled ? 'bg-amber-500 border-amber-600' : 'border-input'}
                                    `}>
                                        {dropSettings.enabled && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <Label className="font-medium">{formatStepKey("drop_outerlayer")}</Label>
                                        <p className="text-sm text-muted-foreground">Remove specific channels from analysis.</p>
                                    </div>
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {dropSettings.enabled && (
                                    <motion.div 
                                        key="drop-outerlayer-content"
                                        className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-amber-200 ml-2.5 overflow-hidden"
                                        initial={sectionAnimation.initial}
                                        animate={sectionAnimation.animate}
                                        exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }} 
                                        transition={sectionAnimation.transition}
                                    >
                                        <FormField
                                            path={`tasks.${currentTaskName}.settings.drop_outerlayer.value`}
                                            label="Channels to Drop"
                                            tooltip="Comma-separated list of channel names to exclude"
                                            value={Array.isArray(dropSettings.value) 
                                                ? dropSettings.value.join(', ') 
                                                : dropSettings.value}
                                            onChange={handleInputChange}
                                            error={errors[`tasks.${currentTaskName}.settings.drop_outerlayer.value`]}
                                            type="text"
                                            placeholder="e.g., E17, E38, E43"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={goToPreviousStep}>Back to Trim & Crop</Button>
                    <Button className="bg-amber-600 hover:bg-amber-700" onClick={goToNextStep}>Next: ICA</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default Step7EogChannels; 