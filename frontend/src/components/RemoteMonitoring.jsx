import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Activity, Heart, Thermometer } from 'lucide-react';

// Mock DB P data over time
const generateData = () => {
    const data = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60000); // Past 2 hours, 5 min intervals
        data.push({
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            bpm: 70 + Math.random() * 20,
            spo2: 95 + Math.random() * 4,
            rr_interval: 0.8 + Math.random() * 0.2,
            rawTime: time
        });
    }
    return data;
};

const mockPatients = [
    { id: 'P-101', name: 'Active Node Alpha', status: 1 },
    { id: 'P-102', name: 'Active Node Beta', status: 1 },
    { id: 'P-103', name: 'Active Node Gamma', status: 1 },
];

export default function RemoteMonitoring() {
    const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
    const [vitalsData, setVitalsData] = useState([]);
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        // Simulate fetching from DB P
        const data = generateData();
        setVitalsData(data);
        setLastUpdated(data[data.length - 1].rawTime.toLocaleTimeString());

        // Simulate real-time updates every 10 seconds
        const interval = setInterval(() => {
            const newData = generateData();
            setVitalsData(newData);
            setLastUpdated(newData[newData.length - 1].rawTime.toLocaleTimeString());
        }, 10000);

        return () => clearInterval(interval);
    }, [selectedPatient]);

    return (
        <div>
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>Remote Patient Monitoring</h2>

            <div style={{ display: 'flex', gap: '2rem' }}>
                {/* Patient Selection Sidebar */}
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Active Patients</h3>
                    {mockPatients.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPatient(p)}
                            className="btn"
                            style={{
                                justifyContent: 'flex-start',
                                backgroundColor: selectedPatient.id === p.id ? 'var(--primary-blue)' : 'var(--bg-white)',
                                color: selectedPatient.id === p.id ? 'white' : 'var(--text-dark)',
                                border: selectedPatient.id === p.id ? 'none' : '1px solid var(--border-light)',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary-red)', marginRight: '10px' }} />
                                {p.id}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detailed Graph View */}
                <div style={{ flex: 1 }}>
                    <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--text-dark)' }}>Vitals: {selectedPatient.id}</h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                    <Clock size={14} style={{ marginRight: '0.4rem' }} /> Last Updated: {lastUpdated}
                                </p>
                            </div>
                            <div style={{ padding: '0.4rem 0.8rem', backgroundColor: 'rgba(46, 129, 255, 0.1)', color: 'var(--accent-blue)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.9rem' }}>
                                Status Code: {selectedPatient.status}
                            </div>
                        </div>

                        {/* BPM & SpO2 Chart */}
                        <div style={{ height: '300px', width: '100%', marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Heart Rate & Oxygen Saturation</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={vitalsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis yAxisId="left" stroke="var(--primary-red)" fontSize={12} label={{ value: 'BPM', angle: -90, position: 'insideLeft' }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="var(--accent-blue)" fontSize={12} label={{ value: 'SpO2 %', angle: 90, position: 'insideRight' }} domain={['dataMin - 2', 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="bpm" stroke="var(--primary-red)" strokeWidth={2} dot={false} name="BPM" />
                                    <Line yAxisId="right" type="monotone" dataKey="spo2" stroke="var(--accent-blue)" strokeWidth={2} dot={false} name="SpO2 (%)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* RR Interval Chart */}
                        <div style={{ height: '200px', width: '100%' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>RR Interval (Seconds)</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={vitalsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis stroke="var(--text-dark)" fontSize={12} domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="rr_interval" stroke="var(--primary-blue)" strokeWidth={2} dot={false} name="RR Interval" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
