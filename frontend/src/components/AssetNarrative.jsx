import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, ShieldAlert, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getNarrative, scanAsset } from '../api/client';

/**
 * AssetNarrative — Displays the LLM-generated risk narrative for a selected asset.
 */
const AssetNarrative = ({ hostname }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);

    const fetchNarrative = useCallback((host) => {
        setLoading(true);
        setError(null);
        getNarrative(host)
            .then(res => {
                setData(res);
            })
            .catch(err => {
                setError(err.message || "Failed to load narrative");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (hostname) {
            fetchNarrative(hostname);
            setScanResult(null);
        }
    }, [hostname, fetchNarrative]);

    const handleRescan = async () => {
        if (!hostname || scanning) return;
        setScanning(true);
        try {
            const res = await scanAsset(hostname);
            setScanResult(res);
            // After scan, refresh narrative to get any updated info if applicable
            fetchNarrative(hostname);
        } catch (err) {
            console.error("Scan failed:", err);
        } finally {
            setScanning(false);
        }
    };

    if (!hostname) {
        return (
            <div className="p-6 rounded-xl bg-surface border border-zinc-800/50 shadow-lg h-full flex flex-col items-center justify-center text-center">
                <ShieldAlert className="w-8 h-8 text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-500">
                    Click an asset from the table to view its risk narrative.
                </p>
            </div>
        );
    }

    const complexityColor = {
        HIGH: 'text-danger border-danger/20 bg-danger/10',
        MEDIUM: 'text-accent border-accent/20 bg-accent/10',
        LOW: 'text-success border-success/20 bg-success/10',
    };

    return (
        <div className="p-6 rounded-xl bg-surface border border-zinc-800/50 shadow-lg h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-accent" />
                    Risk Intelligence
                </h3>
                <button
                    onClick={handleRescan}
                    disabled={scanning || loading}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all disabled:opacity-50"
                    title="Trigger Live Scan"
                >
                    <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin text-primary' : ''}`} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center py-12"
                    >
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="text-xs text-zinc-500 uppercase tracking-widest animate-pulse">Analyzing Target...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-danger py-4"
                    >
                        {error}
                    </motion.div>
                ) : data ? (
                    <motion.div
                        key={hostname}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6 flex-1 flex flex-col"
                    >
                        {/* Asset Identity Card */}
                        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Asset Identity</span>
                                {data.complexity && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${complexityColor[data.complexity.complexity_level] || ''}`}>
                                        {data.complexity.complexity_level}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-mono text-primary truncate" title={hostname}>{hostname}</p>
                        </div>

                        {/* Narrative Content */}
                        <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent rounded-full" />
                            <p className="text-sm text-zinc-300 leading-relaxed italic">
                                "{data.narrative}"
                            </p>
                        </div>

                        {/* Scan Results Overlay */}
                        {scanResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3 rounded-lg bg-primary/5 border border-primary/20"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-success" />
                                    <span className="text-xs font-medium text-zinc-200">Scan Results: {scanResult.status}</span>
                                </div>
                                {scanResult.endpoints?.[0] && (
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className="text-zinc-500">Grade: <span className="text-success font-bold">{scanResult.endpoints[0].grade}</span></div>
                                        <div className="text-zinc-500">IP: <span className="text-zinc-300 font-mono">{scanResult.endpoints[0].ip_address}</span></div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Complexity Multi-Gauge */}
                        {data.complexity && (
                            <div className="mt-auto pt-6 border-t border-zinc-800/50">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4 font-bold flex items-center justify-between">
                                    Migration Complexity Profile
                                    <span className="text-zinc-400">{data.complexity.complexity_score}%</span>
                                </p>
                                <div className="space-y-3">
                                    {Object.entries(data.complexity.contributing_factors || {}).map(([key, val]) => (
                                        <div key={key} className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-zinc-400">
                                                <span>{key.replace('_', ' ').toUpperCase()}</span>
                                                <span>{val}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${val}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full bg-gradient-to-r ${val > 70 ? 'from-danger to-accent' :
                                                        val > 40 ? 'from-accent to-primary' :
                                                            'from-primary to-success'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default AssetNarrative;
