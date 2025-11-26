'use client';

import { useDeckStore } from '@/store/deck-store';
import { useState, useRef, useEffect } from 'react';
import { useServices } from '@/services/service-context';
import { useSettingsStore } from '@/store/settings-store';

export default function LeftPanel() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedParserId, setSelectedParserId] = useState<string>('auto');
  const { addCard, clearDeck, setFetching } = useDeckStore();
  const { deckService } = useServices();
  const { pluginsInitialized } = useSettingsStore();
  const [parsers, setParsers] = useState(deckService.getAvailableParsers());
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pluginsInitialized) {
      setParsers(deckService.getAvailableParsers());
    }
  }, [pluginsInitialized, deckService]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleProcess = async () => {
    setLogs([]);
    clearDeck();
    setFetching(true);

    const result = await deckService.processDecklist(input, selectedParserId, (msg) => {
      // We can use the callback to update logs in real-time if we want,
      // but since we are updating state, we need to be careful about re-renders.
      // For now, let's just append to our local log state.
      addLog(msg.replace('> ', ''));
    });

    if (result.success) {
      result.cards.forEach(card => addCard(card));
    }
    
    setFetching(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-700 p-4 gap-4">
      <h2 className="text-xl font-bold text-green-400">ProxNCut</h2>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-400">Parser</label>
        <select 
          className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm focus:outline-none focus:border-green-500"
          value={selectedParserId}
          onChange={(e) => setSelectedParserId(e.target.value)}
        >
          <option value="auto">Auto-Detect</option>
          {parsers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-400">Add Cards</label>
        <textarea
          className="w-full h-64 p-3 bg-slate-800 border border-slate-700 rounded text-sm font-mono focus:outline-none focus:border-green-500"
          placeholder="4 Lightning Bolt&#10;1 Black Lotus (LEA) 1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleProcess}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium transition-colors"
        >
          Fetch Cards
        </button>
        <button
          onClick={() => { clearDeck(); setLogs([]); }}
          className="px-4 bg-red-600 hover:bg-red-500 text-white py-2 rounded font-medium transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 mt-2">
        <label className="text-sm font-semibold text-slate-400 mb-1">Console</label>
        <div className="flex-1 bg-black rounded p-2 font-mono text-xs text-green-500 overflow-y-auto border border-slate-700 shadow-inner">
          {logs.length === 0 && <span className="text-slate-600 opacity-50">Ready...</span>}
          {logs.map((log, i) => (
            <div key={i} className="whitespace-nowrap">{log}</div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
