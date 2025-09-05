import type { TaskData } from '@/lib/types';

// --- Default Configuration ---

/** 
 * Default structure and values for a single task configuration.
 * Used as a base for templates and custom configurations.
 */
export const defaultTaskSettings: TaskData = {
  task_name: "RestingEyesOpen",
  description: "",
  dataset_name: "",
  input_path: "",
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
        method: "infomax",
        n_components: null,
        fit_params: {
          extended: true,
        },
      },
    },
    component_rejection: {
      enabled: true,
      method: "iclabel",
      value: {
        ic_flags_to_reject: ["muscle", "heart", "eog", "ch_noise", "line_noise"],
        ic_rejection_threshold: 0.3,
        ic_rejection_overrides: {},
        psd_fmax: 50,
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


// --- Predefined Task Templates ---

/**
 * Collection of predefined task configurations for common EEG paradigms.
 */
export const taskTemplates: Record<string, TaskData> = {
  RestingState: {
    task_name: "RestingState",
    description: "Resting state EEG recording",
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
          method: "infomax",
          n_components: null,
          fit_params: {
            extended: true,
          },
        },
      },
      component_rejection: {
        enabled: true,
        method: "iclabel",
        value: {
          ic_flags_to_reject: ["muscle", "heart", "eog", "ch_noise", "line_noise"],
          ic_rejection_threshold: 0.3,
          ic_rejection_overrides: {},
          psd_fmax: 50,
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
  },
  EventBased: {
    task_name: "EventBased",
    description: "Event-based EEG paradigm with stimulus triggers",
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
          method: "infomax",
          n_components: null,
          fit_params: {
            extended: true,
          },
        },
      },
      component_rejection: {
        enabled: true,
        method: "iclabel",
        value: {
          ic_flags_to_reject: ["muscle", "heart", "eog", "ch_noise", "line_noise"],
          ic_rejection_threshold: 0.3,
          ic_rejection_overrides: {},
          psd_fmax: 50,
        },
      },
      epoch_settings: {
        enabled: true,
        value: { tmin: -0.5, tmax: 2.5 },
        event_id: ["DIN8"],
        remove_baseline: { enabled: false, window: [null, 0] },
        threshold_rejection: { enabled: false, volt_threshold: { eeg: 125e-6 } },
      },
    },
  },
};