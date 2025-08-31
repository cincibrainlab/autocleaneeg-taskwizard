import React from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Import local components and types
import FormField from '@/components/FormField'; // Assuming FormField is in the right place
import { EventIdInput } from '@/components/EventIdInput';
import { AnimatedSection } from '@/components/AnimatedSection';
import { TaskData, ValidationErrors } from '@/lib/types'; // Adjust path as needed
import { formatStepKey } from '@/lib/utils'; // Adjust path as needed
import { designSystem, cn } from '@/lib/design-system';

// Animation variants removed - using inline animations for better control

// Define the props interface
interface Step8Props {
    currentTaskName: string;
    taskData: TaskData; // Pass the specific task data
    handleInputChange: (path: string, value: any) => void;
    errors: ValidationErrors;
    goToPreviousStep: () => void;
    goToNextStep: () => void;
    // formatStepKey is imported now
}

const Step8Epochs: React.FC<Step8Props> = ({
    currentTaskName,
    taskData,
    handleInputChange,
    errors,
    goToPreviousStep,
    goToNextStep,
}) => {
    // Ensure settings and epoch_settings exist before rendering
    if (!taskData?.settings?.epoch_settings) {
        // Optionally render a loading state or null
        // Or handle this upstream in App.tsx to not render Step 8 if data is missing
        console.warn("Epoch settings data missing in Step8Epochs");
        return null; 
    }

    const basePath = `tasks.${currentTaskName}.settings.epoch_settings`;

    return (
        <Card className={designSystem.card.container}>
            <CardHeader className={cn(designSystem.card.header, "bg-gradient-to-r from-lime-50 to-green-50 dark:from-slate-900 dark:to-slate-800")}> 
                <CardTitle className={designSystem.card.title}>Epoch Settings</CardTitle>
                <CardDescription className={designSystem.card.description}>Segment continuous data into time-locked epochs for event-related analysis.</CardDescription>
            </CardHeader>
            <CardContent className={cn("space-y-6", designSystem.card.content)}>
                <div className="space-y-6">
                    {/* Main Epoch Settings Toggle */}
                    <AnimatedSection
                        title={formatStepKey("epoch_settings")}
                        description="Configure how data is segmented into epochs."
                        enabled={taskData.settings?.epoch_settings?.enabled || false}
                        onToggle={() => handleInputChange(`${basePath}.enabled`, !taskData.settings?.epoch_settings?.enabled)}
                        contentClassName="pl-8 pt-3 pb-1 space-y-6 border-l-2 border-lime-200 ml-2.5"
                        color="lime"
                    >
                                    {/* Tmin/Tmax Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            path={`${basePath}.value.tmin`}
                                            label="Epoch Start Time (tmin)"
                                            tooltip="Start time of the epoch relative to the event (seconds)."
                                            value={taskData.settings.epoch_settings.value?.tmin?.toString() ?? ''}
                                            onChange={(path, val) => handleInputChange(path, val === '' ? null : parseFloat(val))}
                                            error={errors[`${basePath}.value.tmin`] || errors[`${basePath}.value`]}
                                            type="number"
                                            placeholder="e.g., -0.2"
                                        />
                                         <FormField
                                            path={`${basePath}.value.tmax`}
                                            label="Epoch End Time (tmax)"
                                            tooltip="End time of the epoch relative to the event (seconds)."
                                            value={taskData.settings.epoch_settings.value?.tmax?.toString() ?? ''}
                                            onChange={(path, val) => handleInputChange(path, val === '' ? null : parseFloat(val))}
                                            error={errors[`${basePath}.value.tmax`] || errors[`${basePath}.value`]}
                                            type="number"
                                            placeholder="e.g., 0.5"
                                        />
                                    </div>

                                    {/* Event ID Section */}
                                    <AnimatedSection
                                        title="Event-Based Epochs"
                                        description="Create epochs based on event markers. If disabled, epochs will be fixed-length."
                                        enabled={Boolean(taskData.settings?.epoch_settings?.event_id && Array.isArray(taskData.settings.epoch_settings.event_id))}
                                        onToggle={() => {
                                            const currentValue = taskData.settings?.epoch_settings?.event_id;
                                            const newValue = currentValue ? null : []; 
                                            handleInputChange(`${basePath}.event_id`, newValue);
                                        }}
                                        color="lime"
                                    >
                                        <EventIdInput
                                            eventIds={taskData.settings?.epoch_settings?.event_id || []}
                                            onChange={(eventIds) => handleInputChange(`${basePath}.event_id`, eventIds)}
                                        />
                                    </AnimatedSection>

                                    {/* Baseline Removal Section */}
                                    {taskData.settings.epoch_settings.remove_baseline && (
                                        <AnimatedSection
                                            title="Remove Baseline"
                                            description="Subtract baseline from each epoch."
                                            enabled={taskData.settings?.epoch_settings?.remove_baseline?.enabled || false}
                                            onToggle={() => handleInputChange(`${basePath}.remove_baseline.enabled`, !taskData.settings?.epoch_settings?.remove_baseline?.enabled)}
                                            color="lime"
                                        >
                                            {taskData.settings.epoch_settings.remove_baseline.window && Array.isArray(taskData.settings.epoch_settings.remove_baseline.window) && taskData.settings.epoch_settings.remove_baseline.window.length === 2 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        path={`${basePath}.remove_baseline.window.0`}
                                                        label="Baseline Start (s)"
                                                        tooltip="Start of baseline window relative to event (null = tmin)."
                                                        value={taskData.settings.epoch_settings.remove_baseline.window[0]?.toString() ?? ''} 
                                                        onChange={(path, val) => handleInputChange(path, val === '' ? null : parseFloat(val))}
                                                        error={errors[`${basePath}.remove_baseline.window`] || errors[`${basePath}.remove_baseline.window.0`]}
                                                        type="number"
                                                        placeholder="e.g., -0.2 (empty = tmin)"
                                                    />
                                                    <FormField
                                                        path={`${basePath}.remove_baseline.window.1`}
                                                        label="Baseline End (s)"
                                                        tooltip="End of baseline window relative to event (usually 0 = event onset)."
                                                        value={taskData.settings.epoch_settings.remove_baseline.window[1]?.toString() ?? ''}
                                                        onChange={(path, val) => handleInputChange(path, val === '' ? null : parseFloat(val))}
                                                        error={errors[`${basePath}.remove_baseline.window`] || errors[`${basePath}.remove_baseline.window.1`]}
                                                        type="number"
                                                        placeholder="e.g., 0"
                                                    />
                                                </div>
                                            )}
                                        </AnimatedSection>
                                    )}

                                    {/* Threshold Rejection Section */}
                                    {taskData.settings.epoch_settings.threshold_rejection && (
                                        <AnimatedSection
                                            title="Threshold Rejection"
                                            description="Reject epochs that exceed voltage threshold."
                                            enabled={taskData.settings?.epoch_settings?.threshold_rejection?.enabled || false}
                                            onToggle={() => handleInputChange(`${basePath}.threshold_rejection.enabled`, !taskData.settings?.epoch_settings?.threshold_rejection?.enabled)}
                                            color="lime"
                                        >
                                            {taskData.settings.epoch_settings.threshold_rejection.volt_threshold && (
                                                <FormField
                                                    path={`${basePath}.threshold_rejection.volt_threshold.eeg`}
                                                    label="EEG Threshold (V)"
                                                    tooltip="Voltage threshold in Volts (e.g., 150e-6 for 150 µV)."
                                                    value={taskData.settings.epoch_settings.threshold_rejection.volt_threshold.eeg}
                                                    onChange={handleInputChange}
                                                    error={errors[`${basePath}.threshold_rejection.volt_threshold.eeg`]}
                                                    type="text"
                                                    placeholder="e.g., 150e-6"
                                                />
                                            )}
                                        </AnimatedSection>
                                    )}
                    </AnimatedSection>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={goToPreviousStep} className="px-6 py-3 rounded-xl">← Back to ICA</Button>
                        <Button onClick={goToNextStep} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl">Next: Preview →</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default Step8Epochs; 
