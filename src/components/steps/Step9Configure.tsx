import React from 'react';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Import local components and types
import RejectionPolicySection from '@/components/RejectionPolicySection'; // Adjust path if needed
import ArtifactFunctionDoc from '@/components/ArtifactFunctionDoc';
import { TaskData, ValidationErrors } from '@/lib/types'; // Adjust path as needed
import { designSystem, cn } from '@/lib/design-system';
import { AnimatedSection } from '@/components/AnimatedSection';

// Define the props interface
interface Step9Props {
    currentTaskName: string;
    taskData: TaskData; // Pass the specific task data
    handleInputChange: (path: string, value: any) => void;
    errors: ValidationErrors;
    pythonPreview: string;
    handlePreview: () => void;
    handleDownload: () => Promise<void>; // Assuming it returns Promise<void>
    goToPreviousStep: () => void;
}

const Step9Configure: React.FC<Step9Props> = ({
    currentTaskName,
    taskData,
    handleInputChange,
    errors,
    pythonPreview,
    handlePreview,
    handleDownload,
    goToPreviousStep,
}) => {
    // Ensure taskData and rejection_policy exist if needed by RejectionPolicySection
    if (!taskData) {
        console.warn("Task data missing in Step9Configure");
        return null; // Or render an error/loading state
    }

    const moveFlaggedFiles = taskData.settings?.move_flagged_files || false;

    return (
        <> 
            {/* File Management Options */}
            <Card className={designSystem.card.container}>
                <CardHeader className={cn(designSystem.card.header, "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800")}>
                    <CardTitle className={designSystem.card.title}>File Management</CardTitle>
                    <CardDescription className={designSystem.card.description}>Configure how flagged files should be handled during processing.</CardDescription>
                </CardHeader>
                <CardContent className={cn("space-y-4", designSystem.card.content)}>
                    <div className="flex items-center justify-between space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex-1">
                            <Label htmlFor="move-flagged-files" className="text-sm font-medium">
                                Move Flagged Files
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Automatically move files that fail quality checks to a 'bad' subdirectory
                            </p>
                        </div>
                        <Switch
                            id="move-flagged-files"
                            checked={moveFlaggedFiles}
                            onCheckedChange={(checked) => 
                                handleInputChange(`tasks.${currentTaskName}.settings.move_flagged_files`, checked)
                            }
                        />
                    </div>
                </CardContent>
            </Card>
            
            {/* Preview & Download Section */}
            <Card className={cn(designSystem.card.container, "mt-6")}>
                <CardHeader className={cn(designSystem.card.header, "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800")}> 
                    <CardTitle className={designSystem.card.title}>Preview & Download</CardTitle>
                    <CardDescription className={designSystem.card.description}>Review your complete EEG preprocessing pipeline and generate the Python configuration file.</CardDescription>
                </CardHeader>
                <CardContent className={cn("space-y-4", designSystem.card.content)}>
                    <div className="flex flex-wrap gap-4"> {/* Use flex-wrap for smaller screens */}
                        <Button onClick={handlePreview} className="bg-emerald-600 hover:bg-emerald-700 flex-shrink-0">Preview Python File</Button>
                        <Button onClick={handleDownload} className="bg-teal-600 hover:bg-teal-700 flex-shrink-0">Download Task File</Button>
                    </div>
                    
                    {/* Display Validation errors related to Python file generation */}
                    {(errors.pythonGeneration || errors.fileGeneration) && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errors.pythonGeneration || errors.fileGeneration}</AlertDescription>
                        </Alert>
                    )}
                    
                    {/* Python Preview Area */}
                    {pythonPreview && (
                        <Textarea
                            readOnly
                            value={pythonPreview}
                            className="mt-4 font-mono h-96 text-sm border-emerald-200"
                            placeholder="Python task file preview will appear here..."
                        />
                    )}
                </CardContent>
            </Card>
            
            {/* Artifact Cleaning Functions (scientist-facing) */}
            <div className="mt-6">
              <ArtifactFunctionDoc />
            </div>

            {/* Final Navigation Button */}
            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={goToPreviousStep} className="px-6 py-3 rounded-xl">← Back to Epochs</Button>
                {/* No "Next" button on the final step */}
            </div>
        </>
    );
};

export default Step9Configure; 
