import { useState } from 'react';
import { BrainCircuit, Maximize2, Shield, AlertTriangle } from 'lucide-react';

export default function ModelPredictions() {
    const [estimateLevel, setEstimateLevel] = useState('normal'); // 'extreme', 'normal', 'conservative'

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--primary-blue)', margin: 0, display: 'flex', alignItems: 'center' }}>
                    <BrainCircuit size={24} style={{ marginRight: '0.5rem', color: 'var(--accent-blue)' }} />
                    SEIR Auto-Prediction Models
                </h2>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '800px' }}>
                Observe the simulated spread across localized cells (1km resolution). The RL models automatically adjust SEIR parameters based on disease transmission modes and active reporting inputs.
            </p>

            <div style={{ display: 'flex', gap: '2rem' }}>
                {/* Sidebar Controls */}
                <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Estimate Profiles</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={() => setEstimateLevel('extreme')}
                                className={`btn ${estimateLevel === 'extreme' ? 'btn-danger' : 'btn-outline'}`}
                                style={{ justifyContent: 'flex-start' }}
                            >
                                <AlertTriangle size={18} style={{ marginRight: '0.5rem' }} /> Extreme Spread
                            </button>

                            <button
                                onClick={() => setEstimateLevel('normal')}
                                className={`btn ${estimateLevel === 'normal' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ justifyContent: 'flex-start' }}
                            >
                                <Maximize2 size={18} style={{ marginRight: '0.5rem' }} /> Normal Trajectory
                            </button>

                            <button
                                onClick={() => setEstimateLevel('conservative')}
                                className={`btn ${estimateLevel === 'conservative' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ justifyContent: 'flex-start', backgroundColor: estimateLevel === 'conservative' ? '#2a9d8f' : 'transparent', color: estimateLevel === 'conservative' ? 'white' : 'var(--text-dark)', borderColor: estimateLevel === 'conservative' ? '#2a9d8f' : 'var(--border-light)' }}
                            >
                                <Shield size={18} style={{ marginRight: '0.5rem' }} /> Conservative Estimate
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Live Parameters</h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Transmissibility (β):</span> <strong style={{ color: 'var(--text-dark)' }}>0.84 - 1.12</strong>
                            </p>
                            <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Recovery Rate (γ):</span> <strong style={{ color: 'var(--text-dark)' }}>0.15</strong>
                            </p>
                            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Base Transmission:</span> <strong style={{ color: 'var(--text-dark)' }}>Aerosol</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Map Visualization */}
                <div className="card" style={{ flex: 1, height: '600px', backgroundColor: '#a6cbe3', position: 'relative', overflow: 'hidden' }}>

                    {/* Grid styling to mock geographical cells (1km resolution requirement) */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }} />

                    <svg viewBox="0 0 800 600" style={{ width: '100%', height: '100%', position: 'absolute' }}>
                        <path d="M 200 100 L 600 120 L 700 400 L 400 550 L 150 450 Z" fill="#e8f4f8" stroke="white" strokeWidth="4" />

                        {/* Base node centers */}
                        <circle cx="350" cy="250" r="10" fill="var(--text-dark)" />
                        <circle cx="500" cy="400" r="10" fill="var(--text-dark)" />

                        {/* Spread radiuses based on Estimate Level */}
                        {estimateLevel === 'conservative' && (
                            <>
                                <circle cx="350" cy="250" r="60" fill="var(--primary-red)" opacity="0.3" filter="blur(10px)" />
                                <circle cx="500" cy="400" r="40" fill="var(--primary-red)" opacity="0.3" filter="blur(10px)" />
                            </>
                        )}

                        {estimateLevel === 'normal' && (
                            <>
                                <circle cx="350" cy="250" r="120" fill="var(--primary-red)" opacity="0.4" filter="blur(20px)" />
                                <circle cx="500" cy="400" r="90" fill="var(--primary-red)" opacity="0.4" filter="blur(20px)" />
                                <circle cx="420" cy="320" r="60" fill="#fca311" opacity="0.5" filter="blur(15px)" />
                            </>
                        )}

                        {estimateLevel === 'extreme' && (
                            <>
                                <circle cx="350" cy="250" r="200" fill="var(--primary-red)" opacity="0.6" filter="blur(30px)" />
                                <circle cx="500" cy="400" r="180" fill="var(--primary-red)" opacity="0.5" filter="blur(30px)" />
                                <circle cx="420" cy="320" r="220" fill="#fca311" opacity="0.6" filter="blur(30px)" />
                                <circle cx="280" cy="450" r="100" fill="var(--primary-red)" opacity="0.4" filter="blur(20px)" />
                            </>
                        )}
                    </svg>

                    {/* Scale Marker */}
                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.8rem', fontWeight: 600 }}>
                        Grid Resolution: 1km
                    </div>
                </div>
            </div>
        </div>
    );
}
