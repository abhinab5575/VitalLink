import { useState } from 'react';
import { Search, PlusCircle, AlertCircle } from 'lucide-react';

const COMMON_DISEASES = [
    "COVID-19", "Influenza (Flu)", "Tuberculosis", "Measles",
    "Cholera", "Dengue Fever", "Malaria", "Ebola", "Hepatitis B", "HIV/AIDS"
];

export default function DiseaseReport() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDisease, setSelectedDisease] = useState('');
    const [reports, setReports] = useState([]);

    const filteredDiseases = COMMON_DISEASES.filter(d =>
        d.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleReport = (e) => {
        e.preventDefault();
        if (!selectedDisease && !searchTerm) return;

        const diseaseToReport = selectedDisease || searchTerm;

        // Check if already in local state, increment if so
        const existing = reports.find(r => r.name === diseaseToReport);
        if (existing) {
            setReports(reports.map(r => r.name === diseaseToReport ? { ...r, count: r.count + 1 } : r));
        } else {
            setReports([...reports, { name: diseaseToReport, count: 1 }]);
        }

        setSearchTerm('');
        setSelectedDisease('');
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>Infectious Disease Reporting</h2>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                    <AlertCircle size={20} style={{ marginRight: '0.5rem', fill: 'var(--primary-red)', color: 'white' }} />
                    Report diagnosed cases below. This data is anonymized and aggregated into the state heatmap.
                </p>

                <form onSubmit={handleReport}>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">Search Disease</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Type to search or enter custom disease name..."
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setSelectedDisease(''); }}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>

                        {searchTerm && !selectedDisease && filteredDiseases.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-md)', marginTop: '4px' }}>
                                {filteredDiseases.map(disease => (
                                    <div
                                        key={disease}
                                        onClick={() => { setSelectedDisease(disease); setSearchTerm(disease); }}
                                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--bg-offwhite)' }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-offwhite)'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                    >
                                        {disease}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={!searchTerm} style={{ display: 'flex', alignItems: 'center' }}>
                        <PlusCircle size={18} style={{ marginRight: '0.5rem' }} /> Add to Report Log
                    </button>
                </form>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>Today's Submitted Reports</h3>

                {reports.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No diseases reported by this institution today.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem', fontWeight: 500 }}>Disease Name</th>
                                <th style={{ padding: '1rem', fontWeight: 500 }}>Reported Frequency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--bg-offwhite)' }}>
                                    <td style={{ padding: '1rem', color: 'var(--text-dark)' }}>{report.name}</td>
                                    <td style={{ padding: '1rem', color: 'var(--accent-blue)', fontWeight: 600 }}>{report.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
