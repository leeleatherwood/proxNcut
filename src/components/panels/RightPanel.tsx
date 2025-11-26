'use client';

import { useSettingsStore } from '@/store/settings-store';
import { useDeckStore } from '@/store/deck-store';
import { PaperSize, MachineId } from '@/core/types';
import { useEffect, useState } from 'react';
import { useServices } from '@/services/service-context';

export default function RightPanel() {
  const { 
    activeMachineId, setMachine,
    paperSize, setPaperSize,
    zoom, setZoom,
    sensorSafe, setSensorSafe,
    pluginsInitialized
  } = useSettingsStore();
  
  const { decklist, isFetching } = useDeckStore();
  const { machineService } = useServices();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [machines, setMachines] = useState(machineService.getAvailableMachines());

  useEffect(() => {
    if (pluginsInitialized) {
      setMachines(machineService.getAvailableMachines());
    }
  }, [pluginsInitialized, machineService]);

  const handleDownloadCutFile = async () => {
    const result = await machineService.generateCutFile(activeMachineId, decklist, paperSize, sensorSafe);
    if (!result) return;

    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proxncut-layout.${result.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const blob = await machineService.generatePdf(activeMachineId, decklist, paperSize, sensorSafe);
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proxncut-print.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-l border-slate-700 p-4 gap-6 overflow-y-auto">
      <h2 className="text-xl font-bold">Settings</h2>

      {/* Machine Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-400">Cutter</label>
        <select
          value={activeMachineId}
          onChange={(e) => setMachine(e.target.value as MachineId)}
          className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm focus:outline-none focus:border-green-500"
        >
          {machines.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Paper Size */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-400">Page Size</label>
        <select
          value={paperSize}
          onChange={(e) => setPaperSize(e.target.value as PaperSize)}
          className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm focus:outline-none focus:border-green-500"
        >
          <option value="letter">Letter (8.5 x 11)</option>
          <option value="a4">A4 (210 x 297mm)</option>
        </select>
      </div>

      {/* Sensor Safe Layout */}
      {activeMachineId.includes('silhouette') && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sensorSafe"
            checked={sensorSafe}
            onChange={(e) => setSensorSafe(e.target.checked)}
            className="w-4 h-4 accent-green-500 bg-slate-800 border-slate-700 rounded focus:ring-green-500 focus:ring-2"
          />
          <label htmlFor="sensorSafe" className="text-sm font-semibold text-slate-400 select-none cursor-pointer">
            Sensor Safe Layout
          </label>
        </div>
      )}

      {/* Zoom */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-400">Zoom: {Math.round(zoom * 100)}%</label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-full accent-green-500"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-4 border-t border-slate-700">
        <label className="text-sm font-semibold text-slate-400">Export</label>
        <button
          onClick={handleDownloadPdf}
          disabled={decklist.cards.length === 0 || isFetching || isGeneratingPdf}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded font-medium transition-colors"
        >
          {isFetching ? 'Fetching...' : isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
        </button>
        <button
          onClick={handleDownloadCutFile}
          disabled={decklist.cards.length === 0 || isFetching || isGeneratingPdf}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded font-medium transition-colors"
        >
          {isFetching ? 'Fetching...' : 'Download Cut File'}
        </button>
      </div>

      {/* Machine Specific Info */}
      <div className="p-3 bg-slate-800 rounded text-xs text-slate-400">
        {activeMachineId === 'silhouette' ? (
          <div className="flex flex-col gap-2">
            <p>Silhouette mode enforces registration marks.</p>
            <div className="bg-slate-900 p-2 rounded border border-slate-700">
              <p className="font-bold text-slate-300 mb-1">Required Studio Settings:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Inset: 0.250 in</li>
                <li>Length: 0.375 in</li>
                <li>Thickness: 0.020 in</li>
              </ul>
            </div>
          </div>
        ) : (
          <p>Hand cut mode enforces cut lines. Layout is fixed.</p>
        )}
      </div>
    </div>
  );
}
