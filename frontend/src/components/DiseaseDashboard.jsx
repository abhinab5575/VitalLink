import { useState } from 'react';
import { Map as MapIcon, Layers, Settings2 } from 'lucide-react';

export default function DiseaseDashboard() {
    const [activeLayer, setActiveLayer] = useState('heatmap'); // heatmap, nodes

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--primary-blue)', margin: 0 }}>Regional Disease Dashboard</h2>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setActiveLayer('heatmap')}
                        className={`btn ${activeLayer === 'heatmap' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                    >
                        <Layers size={16} style={{ marginRight: '0.4rem' }} /> Aggregated Heatmap
                    </button>
                    <button
                        onClick={() => setActiveLayer('nodes')}
                        className={`btn ${activeLayer === 'nodes' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                    >
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary-red)', display: 'inline-block', marginRight: '0.4rem' }} />
                        Active Monitor Nodes
                    </button>
                </div>
            </div>

            <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--primary-blue)', position: 'relative' }}>
                {/* Simulated Map Overlay overlayed with a simple aesthetic grid for now until integrated with Mapbox/Google */}
                <div style={{ flex: 1, backgroundColor: '#a6cbe3', position: 'relative', overflow: 'hidden' }}>

                    {/* Grid styling to mock geographical cells (1km resolution requirement) */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }} />

                    {/* Mock Geographical Shape / State outline */}
                    <svg viewBox="0 0 800 600" style={{ width: '100%', height: '100%', position: 'absolute' }}>
                        <path d="M 200 100 L 600 120 L 700 400 L 400 550 L 150 450 Z" fill="#e8f4f8" stroke="white" strokeWidth="4" />

                        {activeLayer === 'heatmap' && (
                            <>
                                {/* Heatmap Blobs simulating "Dense Population Reports" */}
                                <circle cx="350" cy="250" r="80" fill="var(--primary-red)" opacity="0.4" filter="blur(20px)" />
                                <circle cx="370" cy="280" r="120" fill="var(--primary-red)" opacity="0.2" filter="blur(30px)" />
                                <circle cx="500" cy="400" r="60" fill="var(--accent-blue)" opacity="0.3" filter="blur(15px)" />
                                <circle cx="250" cy="350" r="40" fill="#fca311" opacity="0.5" filter="blur(10px)" />
                            </>
                        )}

                        {activeLayer === 'nodes' && (
                            <>
                                {/* Rural Monitoring Nodes (Status 0/1) */}
                                <circle cx="300" cy="200" r="6" fill="var(--primary-red)" />
                                <circle cx="250" cy="280" r="6" fill="var(--primary-red)" />
                                <circle cx="600" cy="350" r="6" fill="var(--primary-red)" />
                                <circle cx="450" cy="420" r="6" fill="var(--accent-blue)" opacity="0.5" />
                                <circle cx="480" cy="500" r="6" fill="var(--accent-blue)" opacity="0.5" />

                                <text x="315" y="205" fill="var(--text-dark)" fontSize="12" fontWeight="bold">Active Node</text>
                                <text x="615" y="355" fill="var(--text-dark)" fontSize="12" fontWeight="bold">Active Node</text>
                                <text x="495" y="505" fill="var(--text-dark)" fontSize="12">Control Group (Status 0)</text>
                            </>
                        )}
                    </svg>
                </div>
            </div>
        </div>
    );
}
