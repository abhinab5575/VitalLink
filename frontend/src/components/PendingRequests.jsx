import { useState } from 'react';
import { MapPin, Check, X } from 'lucide-react';

// Mock pending patients
const mockPending = [
    { id: 'P-10492', age: 45, condition: 'Critical SpO2 Drop', distance: '4.2 km', lat: 34.0522, lng: -118.2437 },
    { id: 'P-99213', age: 62, condition: 'Irregular BPM', distance: '12.5 km', lat: 34.1032, lng: -118.3045 },
];

export default function PendingRequests() {
    const [requests, setRequests] = useState(mockPending);

    const acceptPatient = (id, lat, lng) => {
        // Generate Google Maps URL
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(mapsUrl, '_blank');

        // Remove from pending
        setRequests(requests.filter(r => r.id !== id));
    };

    const declinePatient = (id) => {
        setRequests(requests.filter(r => r.id !== id));
    };

    return (
        <div>
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>Pending Patient Requests</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Review and accept incoming patients requiring immediate attention or long-term remote monitoring.
            </p>

            {requests.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No pending requests at this time.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {requests.map(req => (
                        <div key={req.id} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, color: 'var(--text-dark)' }}>Patient {req.id}</h3>
                                <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', backgroundColor: 'rgba(230, 57, 70, 0.1)', color: 'var(--primary-red)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                                    High Priority
                                </span>
                            </div>

                            <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <p style={{ marginBottom: '0.5rem' }}><strong>Age:</strong> {req.age}</p>
                                <p style={{ marginBottom: '0.5rem' }}><strong>Alert:</strong> {req.condition}</p>
                                <p style={{ display: 'flex', alignItems: 'center', color: 'var(--text-dark)' }}>
                                    <MapPin size={16} style={{ marginRight: '0.5rem', color: 'var(--accent-blue)' }} />
                                    {req.distance} away
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => acceptPatient(req.id, req.lat, req.lng)}
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '0.5rem' }}
                                >
                                    <Check size={18} style={{ marginRight: '0.5rem' }} /> Accept
                                </button>
                                <button
                                    onClick={() => declinePatient(req.id)}
                                    className="btn btn-outline"
                                    style={{ padding: '0.5rem 1rem' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
