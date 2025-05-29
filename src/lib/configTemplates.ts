import type { TaskData, StageFilesConfig } from '@/lib/types';

// --- Default Configuration ---

/** 
 * Default structure and values for a single task configuration.
 * Used as a base for templates and custom configurations.
 */
export const defaultTaskSettings: TaskData = {
  mne_task: "task_type",
  description: "Task description",
  settings: {
    resample_step: { enabled: true, value: 250 },
    filtering: {
      enabled: true,
      value: {
        l_freq: 1,
        h_freq: 100,
        notch_freqs: [60, 120],
        notch_widths: 5,
      },
    },
    drop_outerlayer: { enabled: false, value: [] },
    eog_step: { enabled: false, value: [] },
    trim_step: { enabled: true, value: 4 },
    crop_step: { enabled: false, value: { start: 0, end: null } },
    reference_step: { enabled: true, value: "average" },
    montage: { enabled: true, value: "GSN-HydroCel-129" },
    ICA: {
      enabled: true,
      value: {
        method: "picard",
        n_components: null,
        fit_params: {
          ortho: false,
          extended: true,
        },
      },
    },
    ICLabel: {
      enabled: true,
      value: {
        ic_flags_to_reject: ["muscle", "heart", "eog", "ch_noise", "line_noise"],
        ic_rejection_threshold: 0.3,
      },
    },
    epoch_settings: {
      enabled: true,
      value: { tmin: -1, tmax: 1 },
      event_id: null,
      remove_baseline: { enabled: false, window: [null, 0] },
      threshold_rejection: { enabled: false, volt_threshold: { eeg: 125e-6 } },
    },
  },
};

// Default configuration for stage_files (top-level)
export const defaultStageFilesConfig: StageFilesConfig = {
  post_import: { enabled: true, suffix: "_postimport" },
  post_resample: { enabled: false, suffix: "_postresample" },
  post_filter: { enabled: true, suffix: "_postfilter" },
  post_outerlayer: { enabled: false, suffix: "_postouterlayer" },
  post_trim: { enabled: false, suffix: "_posttrim" },
  post_crop: { enabled: false, suffix: "_postcrop" },
  post_basic_steps: { enabled: true, suffix: "_postbasicsteps" },
  post_artifact_detection: { enabled: false, suffix: "_postartifactdetection" },
  post_rereference: { enabled: false, suffix: "_postreference" },
  post_bad_channels: { enabled: true, suffix: "_postbadchannels" },
  post_clean_raw: { enabled: true, suffix: "_postcleanraw" },
  post_epochs: { enabled: true, suffix: "_postepochs" },
  post_drop_bad_epochs: { enabled: true, suffix: "_postdropbadepochs" },
  post_gfp_clean: { enabled: true, suffix: "_postgfpclean" },
  post_autoreject: { enabled: false, suffix: "_postautoreject" },
  post_comp: { enabled: true, suffix: "_postcomp" },
  post_edit: { enabled: true, suffix: "_postedit" },
};

// --- Predefined Task Templates ---

/**
 * Collection of predefined task configurations for common EEG paradigms.
 */
export const taskTemplates: Record<string, TaskData> = {
  RestingEyesOpen: {
    mne_task: "rest",
    description: "Resting state with eyes open",
    settings: {
      resample_step: { enabled: true, value: 250 },
      filtering: {
        enabled: true,
        value: {
          l_freq: 1,
          h_freq: 100,
          notch_freqs: [60, 120],
          notch_widths: 5,
        },
      },
      drop_outerlayer: { enabled: false, value: [] },
      eog_step: { enabled: false, value: [1, 32, 8, 14, 17, 21, 25, 125, 126, 127, 128] },
      trim_step: { enabled: true, value: 4 },
      crop_step: { enabled: false, value: { start: 0, end: 60 } },
      reference_step: { enabled: true, value: "average" },
      montage: { enabled: true, value: "GSN-HydroCel-129" },
      ICA: {
        enabled: true,
        value: {
          method: "picard",
          n_components: null,
          fit_params: {
            ortho: false,
            extended: true,
          },
        },
      },
      ICLabel: {
        enabled: true,
        value: {
          ic_flags_to_reject: ["muscle", "heart", "eog", "ch_noise", "line_noise"],
          ic_rejection_threshold: 0.3,
        },
      },
      epoch_settings: {
        enabled: true,
        value: { tmin: -1, tmax: 1 },
        event_id: null,
        remove_baseline: { enabled: false, window: [null, 0] },
        threshold_rejection: { enabled: true, volt_threshold: { eeg: 125e-6 } },
      },
    },
  },
  ChirpDefault: {
    mne_task: "chirp",
    description: "Chirp auditory stimulus task",
    settings: {
      resample_step: { enabled: true, value: 250 },
      filtering: {
        enabled: true,
        value: {
          l_freq: 1,
          h_freq: 100,
          notch_freqs: [60, 120],
          notch_widths: 5,
        },
      },
      drop_outerlayer: {
        enabled: false,
        value: ["E17", "E38", "E43", "E44", "E48", "E49", "E113", "E114", "E119",
                "E120", "E121", "E56", "E63", "E68", "E73", "E81", "E88", "E94",
                "E99", "E107"],
      },
      eog_step: { enabled: false, value: [] },
      trim_step: { enabled: true, value: 4 },
      crop_step: { enabled: false, value: { start: 0, end: 120 } },
      reference_step: { enabled: false, value: "average" },
      montage: { enabled: true, value: "GSN-HydroCel-129" },
      ICA: {
        enabled: true,
        value: {
          method: "picard",
          n_components: null,
          fit_params: {
            ortho: false,
            extended: true,
          },
        },
      },
      ICLabel: {
        enabled: true,
        value: {
          ic_flags_to_reject: ["muscle", "heart", "eog", "ch_noise", "line_noise"],
          ic_rejection_threshold: 0.3,
        },
      },
      epoch_settings: {
        enabled: true,
        value: { tmin: -0.5, tmax: 2.5 },
        event_id: "{'DIN8'}",
        remove_baseline: { enabled: false, window: [null, 0] },
        threshold_rejection: { enabled: true, volt_threshold: { eeg: 125e-6 } },
      },
    },
  },
  AssrDefault: {
    mne_task: "Assr",
    description: "Auditory steady state response task",
    settings: {
      resample_step: { enabled: true, value: 250 },
      filtering: {
        enabled: true,
        value: {
          l_freq: 1,
          h_freq: 100,
          notch_freqs: [60, 120],
          notch_widths: 5,
        },
      },
      drop_outerlayer: { enabled: false, value: [] },
      eog_step: { enabled: false, value: [] },
      trim_step: { enabled: true, value: 4 },
      crop_step: { enabled: false, value: { start: 0, end: null } },
      reference_step: { enabled: false, value: "average" },
      montage: { enabled: true, value: "GSN-HydroCel-129" },
      ICA: {
        enabled: true,
        value: {
          method: "picard",
          n_components: null,
          fit_params: {
            ortho: false,
            extended: true,
          },
        },
      },
      ICLabel: {
        enabled: true,
        value: {
          ic_flags_to_reject: ["muscle", "heart", "eog", "ch_noise", "line_noise"],
          ic_rejection_threshold: 0.3,
        },
      },
      epoch_settings: {
        enabled: true,
        value: { tmin: -0.5, tmax: 2.7 },
        event_id: "{'DI66': 1}",
        remove_baseline: { enabled: false, window: [null, 0] },
        threshold_rejection: { enabled: false, volt_threshold: { eeg: 150e-6 } },
      },
    },
  },
};