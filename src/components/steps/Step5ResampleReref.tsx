import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FormField from '../FormField'; 
import { AnimatedSection } from '@/components/AnimatedSection';
import type { TaskData, ValidationErrors } from '@/lib/types';
import { formatStepKey } from '@/lib/utils'; 

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
    <Card className="border border-slate-200/50 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-50 to-orange-50 border-b border-slate-200/50 px-8 py-6">
            <CardTitle className="text-2xl font-bold text-slate-800">Resample & Rereference</CardTitle> 
            <CardDescription className="text-slate-600 text-lg">Configure data resampling rate and rereferencing options for optimal signal processing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
            <div className="space-y-6">
                {/* Resample Section */}
                {resampleSettings && (
                    <AnimatedSection
                        title={formatStepKey("resample_step")}
                        description="Change the sampling rate of the EEG data."
                        enabled={resampleSettings.enabled}
                        onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.resample_step.enabled`, !resampleSettings.enabled)}
                        contentClassName="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-rose-200 ml-2.5"
                        color="rose"
                    >
                        <FormField
                            path={`tasks.${currentTaskName}.settings.resample_step.value`}
                            label="New Sampling Rate (Hz)"
                            tooltip="Target sampling rate for resampling (e.g., 250, 500)"
                            value={resampleSettings.value}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.settings.resample_step.value`]}
                            type="number"
                            placeholder="e.g., 250"
                        />
                    </AnimatedSection>
                )}

                {/* Rereference Section */}
                {referenceSettings && (
                    <AnimatedSection
                        title={formatStepKey("reference_step")}
                        description="Set the reference scheme for the EEG data."
                        enabled={referenceSettings.enabled}
                        onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.reference_step.enabled`, !referenceSettings.enabled)}
                        contentClassName="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-rose-200 ml-2.5"
                        color="rose"
                    >
                        <FormField
                            path={`tasks.${currentTaskName}.settings.reference_step.value`}
                            label="Reference Type"
                            tooltip="Reference scheme to use (e.g., 'average', 'REST', channel name)"
                            value={referenceSettings.value}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.settings.reference_step.value`]}
                            type="text"
                            placeholder="e.g., average"
                        />
                    </AnimatedSection>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200/50">
                    <Button variant="outline" onClick={goToPreviousStep} className="px-6 py-3 rounded-xl">
                        ← Back to Filtering & Montage
                    </Button>
                    <Button onClick={goToNextStep} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl">
                        Next: Trim & Crop →
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default Step5ResampleReref;