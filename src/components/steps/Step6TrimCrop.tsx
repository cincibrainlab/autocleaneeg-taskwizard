import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FormField from '../FormField'; 
import { AnimatedSection } from '@/components/AnimatedSection';
import type { TaskData, ValidationErrors } from '@/lib/types';
import { formatStepKey } from '@/lib/utils'; 

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
    <Card className="border border-slate-200/50 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-200/50 px-8 py-6">
            <CardTitle className="text-2xl font-bold text-slate-800">Data Trimming & Cropping</CardTitle>
            <CardDescription className="text-slate-600 text-lg">Configure temporal data boundaries to remove edge artifacts and focus on relevant time windows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
            <div className="space-y-6">
                {/* Trim Section */}
                {trimSettings && (
                    <AnimatedSection
                        title={formatStepKey("trim_step")}
                        description="Remove edge artifacts by trimming data from the beginning and end."
                        enabled={trimSettings.enabled}
                        onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.trim_step.enabled`, !trimSettings.enabled)}
                        contentClassName="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-orange-200 ml-2.5"
                        color="orange"
                    >
                        <FormField
                            path={`tasks.${currentTaskName}.settings.trim_step.value`}
                            label="Trim Duration (seconds)"
                            tooltip="Amount of data to trim from beginning and end (seconds)"
                            value={trimSettings.value}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.settings.trim_step.value`]}
                            type="number"
                            placeholder="e.g., 4"
                        />
                    </AnimatedSection>
                )}

                {/* Crop Section */}
                {cropSettings && (
                    <AnimatedSection
                        title={formatStepKey("crop_step")}
                        description="Crop data to a specific time window."
                        enabled={cropSettings.enabled}
                        onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.crop_step.enabled`, !cropSettings.enabled)}
                        contentClassName="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-orange-200 ml-2.5"
                        color="orange"
                    >
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                path={`tasks.${currentTaskName}.settings.crop_step.value.start`}
                                label="Start Time (seconds)"
                                tooltip="Start time for cropping (null = from beginning)"
                                value={cropSettings.value?.start?.toString() ?? ''}
                                onChange={(path, val) => handleInputChange(path, val === '' ? null : parseFloat(val))}
                                error={errors[`tasks.${currentTaskName}.settings.crop_step.value.start`]}
                                type="number"
                                placeholder="e.g., 0 (empty = from start)"
                            />
                            <FormField
                                path={`tasks.${currentTaskName}.settings.crop_step.value.end`}
                                label="End Time (seconds)"
                                tooltip="End time for cropping (null = to end)"
                                value={cropSettings.value?.end?.toString() ?? ''}
                                onChange={(path, val) => handleInputChange(path, val === '' ? null : parseFloat(val))}
                                error={errors[`tasks.${currentTaskName}.settings.crop_step.value.end`]}
                                type="number"
                                placeholder="e.g., 60 (empty = to end)"
                            />
                        </div>
                    </AnimatedSection>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={goToPreviousStep} className="px-6 py-3 rounded-xl">← Back to Resample & Rereference</Button>
                    <Button onClick={goToNextStep} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl">Next: EOG & Channels →</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default Step6TrimCrop;