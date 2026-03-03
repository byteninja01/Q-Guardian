import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';
import { postScenario } from '../api/client';

/**
 * ScenarioSliders — Interactive controls for CRQC threat modeling.
 *
 * Props:
 *   onScenarioUpdate(results, crqcYear) — callback when sliders change
 */
const ScenarioSliders = ({ onScenarioUpdate }) => {
    const [crqcYear, setCrqcYear] = useState(2031);
    const [migrationStart, setMigrationStart] = useState(2026);
    const [isLoading, setIsLoading] = useState(false);

    const handleApply = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await postScenario(crqcYear, migrationStart);
            onScenarioUpdate?.(result.data, crqcYear);
        } catch (err) {
            console.error("Scenario update failed:", err);
        } finally {
            setIsLoading(false);
        }
    }, [crqcYear, migrationStart, onScenarioUpdate]);

    // Debounced auto-apply on slider change
    const handleCrqcChange = (e) => {
        const val = parseInt(e.target.value);
        setCrqcYear(val);
    };

    const handleMigrationChange = (e) => {
        const val = parseInt(e.target.value);
        setMigrationStart(val);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-surface border border-zinc-800/50 shadow-lg glass"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2 uppercase tracking-tighter">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    Threat Modeling Console
                </h3>
                <button
                    onClick={handleApply}
                    disabled={isLoading}
                    className="px-6 py-2 rounded-lg text-xs font-bold bg-primary text-zinc-900 hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)] active:scale-95"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-1.5 ">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            CALCULATING…
                        </span>
                    ) : 'COMMIT SCENARIO'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CRQC Arrival Year Slider */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                            CRQC Arrival Year
                        </label>
                        <span className="text-sm font-mono font-semibold text-danger">
                            {crqcYear}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="2028"
                        max="2040"
                        value={crqcYear}
                        onChange={handleCrqcChange}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-danger"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono">
                        <span>2028</span>
                        <span>Aggressive</span>
                        <span>2040</span>
                    </div>
                </div>

                {/* Migration Start Year Slider */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                            Migration Start Year
                        </label>
                        <span className="text-sm font-mono font-semibold text-primary">
                            {migrationStart}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="2025"
                        max="2035"
                        value={migrationStart}
                        onChange={handleMigrationChange}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono">
                        <span>2025</span>
                        <span>Proactive</span>
                        <span>2035</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ScenarioSliders;
