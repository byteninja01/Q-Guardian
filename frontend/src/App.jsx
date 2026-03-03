import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Activity, BarChart3, Database, AlertTriangle, ShieldCheck, Download, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPortfolioSummary, getCBOM, downloadBoardBrief } from './api/client';
import SurvivalCurve from './components/SurvivalCurve';
import QuantumShadow from './components/QuantumShadow';
import ScenarioSliders from './components/ScenarioSliders';
import AssetNarrative from './components/AssetNarrative';

function App() {
  const [summary, setSummary] = useState(null);
  const [cbom, setCbom] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeCurve, setActiveCurve] = useState(null);
  const [crqcYear, setCrqcYear] = useState(2031);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, cbomRes] = await Promise.all([
          getPortfolioSummary(),
          getCBOM()
        ]);
        setSummary(sumRes);
        setCbom(cbomRes.data);
        if (cbomRes.data.length > 0) {
          setActiveCurve(cbomRes.data[0].survival_curve);
          setSelectedAsset(cbomRes.data[0].hostname);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleScenarioUpdate = useCallback((scenarioData, newCrqcYear) => {
    setCrqcYear(newCrqcYear);
    // Update the active curve to the first asset's new curve
    if (scenarioData && scenarioData.length > 0) {
      const selected = scenarioData.find(d => d.hostname === selectedAsset);
      setActiveCurve(selected ? selected.survival_curve : scenarioData[0].survival_curve);
    }
  }, [selectedAsset]);

  const handleAssetClick = useCallback((asset) => {
    setSelectedAsset(asset.hostname);
    setActiveCurve(asset.survival_curve);
  }, []);

  const handleDownloadBrief = useCallback(async () => {
    setDownloadingPdf(true);
    try {
      await downloadBoardBrief();
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloadingPdf(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800 bg-background/80 backdrop-blur-md z-50 flex items-center px-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-zinc-900" />
          </div>
          <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400">
            Q-Guardian 2.0
          </span>
          <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            BETA
          </span>
        </div>
        <button
          onClick={handleDownloadBrief}
          disabled={downloadingPdf}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {downloadingPdf ? (
            <>
              <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Board Brief
            </>
          )}
        </button>
      </nav>

      {/* Main dashboard content */}
      <main className="pt-24 px-6 mx-auto max-w-7xl pb-12 relative">
        <div className="fixed inset-0 cyber-grid pointer-events-none opacity-50" />

        <header className="mb-8 relative z-10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-br from-zinc-100 to-zinc-500 uppercase">
                Intelligence Dashboard
              </h1>
              <p className="text-zinc-400 font-medium tracking-wide">
                <span className="text-primary mr-2">/</span> CRYPTOGRAPHIC SURVIVAL ANALYTICS
                <span className="mx-2 text-zinc-800">|</span>
                <span className="text-accent">ADVERSARIAL HARVEST PRIORITIZATION</span>
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="space-y-6">
            <div className="flex animate-pulse space-x-4 mb-8">
              <div className="h-32 bg-zinc-800 rounded-xl w-full" />
              <div className="h-32 bg-zinc-800 rounded-xl w-full" />
              <div className="h-32 bg-zinc-800 rounded-xl w-full" />
            </div>
            <div className="h-64 bg-zinc-800 rounded-xl animate-pulse" />
          </div>
        ) : (
          <>
            {/* ── Stat Cards ──────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl bg-surface border border-zinc-800/50 shadow-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-zinc-400">Assets Scanned</h3>
                  <Database className="w-4 h-4 text-zinc-500" />
                </div>
                <p className="text-3xl font-semibold">{summary?.assets_scanned || 0}</p>
                <div className="mt-2 text-xs text-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success opacity-80 animate-pulse" /> Live via passive CT stream
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-xl bg-surface border border-zinc-800/50 shadow-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-zinc-400">Quantum Debt Accumulation</h3>
                  <Activity className="w-4 h-4 text-zinc-500" />
                </div>
                <p className="text-3xl font-semibold">+${(summary?.quantum_debt_rate || 0).toLocaleString()}<span className="text-lg text-zinc-500 font-normal">/mo</span></p>
                <div className="mt-2 text-xs text-danger flex items-center gap-1">
                  {summary?.debt_trend} vs last quarter
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-xl bg-surface border border-zinc-800/50 shadow-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-danger/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-zinc-400">Median Survival Horizon</h3>
                  <BarChart3 className="w-4 h-4 text-zinc-500" />
                </div>
                <p className="text-3xl font-semibold">{summary?.median_survival_horizon || 0}<span className="text-lg text-zinc-500 font-normal"> yrs</span></p>
                <div className="mt-2 text-xs text-zinc-400">
                  Under {crqcYear} median CRQC scenario
                </div>
              </motion.div>
            </div>

            {/* ── CRQC Scenario Sliders ───────────────── */}
            <div className="mb-6">
              <ScenarioSliders onScenarioUpdate={handleScenarioUpdate} />
            </div>

            {/* ── Survival Curve ──────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 p-6 rounded-xl bg-surface border border-zinc-800/50 shadow-lg w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Cryptographic Survival Probability S(t)
                </h3>
                <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                  Asset: {selectedAsset || 'Unknown'}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-6">
                Bayesian probability that encrypted data remains secure over time. The shaded area represents the Harvest-Now-Decrypt-Later exposure footprint.
              </p>
              {activeCurve && (
                <SurvivalCurve data={activeCurve} />
              )}
            </motion.div>

            {/* ── Quantum Shadow Timeline ─────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 p-6 rounded-xl bg-surface border border-zinc-800/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Quantum Shadow Timeline
                </h3>
                <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                  HNDL Exposure Windows
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-4">
                Each row shows an asset's harvest-now-decrypt-later exposure window. The <span className="text-danger font-medium">red overlap zone</span> marks the period where intercepted data becomes decryptable.
              </p>
              <QuantumShadow cbom={cbom} crqcYear={crqcYear} />
            </motion.div>

            {/* ── Red Team Table + Narrative Panel ─────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-2 p-6 rounded-xl bg-surface border border-zinc-800/50 shadow-lg min-h-[400px]"
              >
                <h3 className="text-lg font-medium tracking-tight mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-zinc-400" />
                  Red Team Harvest Prioritization
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-3">Target Asset</th>
                        <th className="px-4 py-3">Algorithm</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Migration</th>
                        <th className="px-4 py-3 text-right">Attacker ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cbom.map((asset, idx) => (
                        <tr
                          key={idx}
                          onClick={() => handleAssetClick(asset)}
                          className={`border-b border-zinc-800/50 cursor-pointer transition-colors ${selectedAsset === asset.hostname
                            ? 'bg-primary/5 border-l-2 border-l-primary'
                            : 'hover:bg-zinc-800/20'
                            }`}
                        >
                          <td className="px-4 py-3 font-medium text-zinc-200">{asset.hostname}</td>
                          <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{asset.algorithm_strength}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${asset.target_priority === 'CRITICAL' ? 'bg-danger/10 text-danger border border-danger/20' :
                              asset.target_priority === 'HIGH' ? 'bg-accent/10 text-accent border border-accent/20' :
                                'bg-zinc-800 text-zinc-300'
                              }`}>
                              {asset.target_priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${asset.complexity_level === 'HIGH' ? 'bg-danger/10 text-danger border border-danger/20' :
                              asset.complexity_level === 'MEDIUM' ? 'bg-accent/10 text-accent border border-accent/20' :
                                'bg-success/10 text-success border border-success/20'
                              }`}>
                              {asset.complexity_level || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-zinc-300">{asset.roi_score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Narrative Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <AssetNarrative hostname={selectedAsset} />
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
