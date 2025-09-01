import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { designSystem, cn } from '@/lib/design-system'

const PY_FUNC = `"""Dense oscillatory artifact detection for EEG data.

This module provides standalone functions for identifying and annotating dense
oscillatory multichannel artifacts in continuous EEG data.
"""

from typing import Optional

import mne
import numpy as np


def detect_dense_oscillatory_artifacts(
    raw: mne.io.Raw,
    window_size_ms: int = 100,
    channel_threshold_uv: float = 45,
    min_channels: int = 75,
    padding_ms: float = 500,
    annotation_label: str = "BAD_REF_AF",
    verbose: Optional[bool] = None,
) -> mne.io.Raw:
    """Detect smaller, dense oscillatory multichannel artifacts.

    This function identifies oscillatory artifacts that affect multiple channels
    simultaneously, while excluding large single deflections. It uses a sliding
    window approach to detect periods where many channels simultaneously show
    high peak-to-peak amplitudes.

    Notes (Algorithm)
    -----------------
    1) Slide a short window across the continuous data
    2) For each window, compute peak-to-peak amplitude (per channel)
    3) Count channels that exceed an amplitude threshold (in µV)
    4) If the count ≥ min_channels, mark the window as artifact
    5) Add pre/post padding so the full artifact is captured
    """
    # Convert units and derive sizes
    sfreq = raw.info["sfreq"]
    window = int(window_size_ms * sfreq / 1000)
    thresh_v = channel_threshold_uv * 1e-6
    pad_s = padding_ms / 1000.0

    data, times = raw.get_data(return_times=True)
    n_ch, n_samp = data.shape

    ann = []
    for start in range(0, n_samp - window, window):
        seg = data[:, start : start + window]
        ptp = np.ptp(seg, axis=1)
        n_exceed = np.sum(ptp > thresh_v)
        if n_exceed >= min_channels:
            t0 = max(times[start] - pad_s, times[0])
            t1 = min(times[start + window] + pad_s, times[-1])
            ann.append([t0, t1 - t0, annotation_label])

    out = raw.copy()
    for onset, duration, desc in ann:
        out.annotations.append(onset=onset, duration=duration, description=desc)
    return out
`

export default function ArtifactFunctionDoc() {
  return (
    <Card className={cn(designSystem.card.container)}>
      <CardHeader className={cn(designSystem.card.header, 'bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800')}>
        <CardTitle className={designSystem.card.title}>Artifact Cleaning Functions</CardTitle>
        <CardDescription className={designSystem.card.description}>
          Dense oscillatory artifact detection — readable code and a plain-language summary for scientists.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn('space-y-6', designSystem.card.content)}>
        <section className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Core idea</h3>
          <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <li>Short sliding window scans the continuous EEG.</li>
            <li>Peak-to-peak amplitude is computed per channel within each window.</li>
            <li>Windows where many channels exceed a µV threshold are flagged.</li>
            <li>Padding is added so the entire artifact segment is captured.</li>
            <li>Segments are annotated, not deleted, preserving raw integrity.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Parameter intuition</h3>
          <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <li><b>window_size_ms</b>: 50–200 ms — smaller is more sensitive, larger is smoother.</li>
            <li><b>channel_threshold_uv</b>: 30–60 µV — amplitude cutoff per channel.</li>
            <li><b>min_channels</b>: 50–100 — density requirement across electrodes.</li>
            <li><b>padding_ms</b>: 200–1000 ms — ensures full artifact coverage.</li>
          </ul>
        </section>

        <section>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">Python (read-only)</div>
            <pre className="m-0 p-4 overflow-x-auto text-xs leading-relaxed font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
{PY_FUNC}
            </pre>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

