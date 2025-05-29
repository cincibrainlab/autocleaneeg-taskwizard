import React from 'react';
import FormField from './FormField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Define types (can be imported from a central location later)
interface StageFile {
    enabled: boolean;
    suffix: string;
}

export interface StageFiles {
    [stageName: string]: StageFile; // Index signature for dynamic stage names
}

// Define props for the component
interface StageFilesSectionProps {
  stageFiles: StageFiles | undefined;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string>;
}

// Simple mapping for potentially more descriptive labels if needed
const stageLabels: Record<string, string> = {
    post_import: "Post Import",
    post_prepipeline: "Post Preprocessing Pipeline",
    post_resample: "Post Resample",
    post_outerlayer: "Post Outer Layer Drop",
    post_trim: "Post Trim",
    post_crop: "Post Crop",
    post_pylossless: "Post PyLossless",
    post_artifact_detection: "Post Artifact Detection",
    post_reference: "Post Reference",
    post_rejection_policy: "Post Rejection Policy Apply",
    post_bad_channels: "Post Bad Channel Handling",
    post_clean_raw: "Post Clean Raw",
    post_epochs: "Post Epoching",
    post_drop_bad_epochs: "Post Drop Bad Epochs",
    post_gfp_clean: "Post GFP Clean",
    post_autoreject: "Post Autoreject",
    post_comp: "Post Component Analysis",
    post_edit: "Post Manual Edit",
    checkpoint: "Checkpoint",
};

/**
 * Renders the form section for the 'stage_files' part of the configuration.
 */
const StageFilesSection: React.FC<StageFilesSectionProps> = ({ stageFiles, onChange, errors }) => {
  const currentStageFiles = stageFiles ?? {};
  const basePath = 'stage_files';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage Output Files</CardTitle>
        <CardDescription>
          Enable or disable saving intermediate BIDS-derivative `.fif` files after specific processing stages.
          The suffix will be appended to the original filename.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
          {Object.entries(currentStageFiles).map(([stageName, stageConfig]) => (
            <div key={stageName} className="flex items-center justify-between p-2 border rounded-md">
              <FormField
                path={`${basePath}.${stageName}.enabled`}
                // Use defined label or format stage name
                label={stageLabels[stageName] ?? stageName.replace(/_/g, ' ').replace(/^post /, '').replace(/\b\w/g, l => l.toUpperCase())}
                tooltip={`Enable saving file after ${stageName} stage with suffix: ${stageConfig.suffix}`}
                value={stageConfig.enabled}
                onChange={onChange}
                error={errors[`${basePath}.${stageName}.enabled`]}
                type="boolean"
                // Remove default bottom margin for tighter layout in grid
                className="mb-0 flex-grow mr-2" 
              />
              {/* Display suffix read-only */}
              <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">{stageConfig.suffix}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StageFilesSection; 