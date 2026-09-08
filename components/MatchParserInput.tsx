"import React, { useState } from 'react';

export default function MatchParserInput() {
  const [shareCode, setShareCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareCode) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/valve/parse-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Success: ${data.message}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl max-w-xl mx-auto my-6 text-white">
      <h3 className="text-lg font-bold mb-2">CS2 Match Replay Ingestion</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Enter a Valve match share code to download and parse sub-tick combat telemetry.
      </p>
      <form onSubmit={handleParse} className="flex gap-2">
        <input
          type="text"
          value={shareCode}
          onChange={(e) => setShareCode(e.target.value)}
          placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"
          className="flex-1 bg-zinc-950 border border-zinc-700 px-4 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Queuing...' : 'Parse Demo'}
        </button>
      </form>
      {status && <p className="mt-3 text-xs text-indigo-300">{status}</p>}
    </div>
  );
}
