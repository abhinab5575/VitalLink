import { useState } from 'react';
import { AlertOctagon, CheckCircle2, TrendingUp, MapPin } from 'lucide-react';

const mockAnomalies = [
    { id: 'ANM-902', location: 'Rural Sector 7G', type: 'SpO2 Drop Cluster', confidence: '84%', patientsCount: 14, time: '2 hrs ago', status: 'pending' },
    { id: 'ANM-811', location: 'Urban Outskirt B', type: 'Fever Spike Pattern', confidence: '92%', patientsCount: 38, time: '5 hrs ago', status: 'verified' },
];

export default function AnomalyDetection() {
    const [anomalies, setAnomalies] = useState(mockAnomalies);

    const resolveAnomaly = (id) => {
        setAnomalies(anomalies.map(a => a.id === id ? { ...a, status: 'verified' } : a));
    };

    return (
        <div>
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>Automated Anomaly Detection</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '800px' }}>
                Review potential outbreaks flagged by the secondary RL model tracking <strong>Status 0</strong> control group nodes.
                Confirming these anomalies provides positive reinforcement to the models.
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {anomalies.map(anomaly => (
                    <div key={anomaly.id} className="card" style={{ padding: '0', display: 'flex', borderLeft: anomaly.status === 'pending' ? '5px solid var(--primary-red)' : '5px solid #2a9d8f' }}>

                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', color: 'var(--text-dark)' }}>
                                    {anomaly.status === 'pending' ? <AlertOctagon size={20} style={{ color: 'var(--primary-red)', marginRight: '0.5rem' }} /> : <CheckCircle2 size={20} style={{ color: '#2a9d8f', marginRight: '0.5rem' }} />}
                                    {anomaly.type}
                                </h3>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{anomaly.time}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <MapPin size={16} style={{ marginRight: '0.4rem' }} /> {anomaly.location}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <TrendingUp size={16} style={{ marginRight: '0.4rem' }} /> {anomaly.patientsCount} affected nodes
                                </span>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-offwhite)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', minWidth: '200px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: anomaly.confidence > '80%' ? 'var(--primary-red)' : 'var(--accent-blue)', lineHeight: 1 }}>
                                {anomaly.confidence}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Model Confidence
                            </div>

                            {anomaly.status === 'pending' ? (
                                <button onClick={() => resolveAnomaly(anomaly.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                    Verify & Train Model
                                </button>
                            ) : (
                                <span style={{ color: '#2a9d8f', fontWeight: 600, fontSize: '0.9rem' }}>Verified ✓</span>
                            )}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
