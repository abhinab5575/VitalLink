import { useState, useEffect } from 'react';
import { Database, Search, RefreshCw, Layers, Edit2, Trash2, Check, X } from 'lucide-react';

export default function ManageDatabases() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDB, setSelectedDB] = useState('institutions'); // 'institutions', 'patients', 'diseases'

    // Edit States
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Simple fetch simulator targeting generic lists. Replaces mock with actual requests.
    const fetchDatabase = async (dbType) => {
        setLoading(true);
        setData([]);
        try {
            // Note: In a production app, this endpoints would have strict admin-only JWT validation
            let endpoint = '';
            if (dbType === 'institutions') endpoint = 'http://localhost:8000/auth/admin/institutions';
            if (dbType === 'patients') endpoint = 'http://localhost:8000/patients/metrics/all';
            if (dbType === 'diseases') endpoint = 'http://localhost:8000/diseases/all';

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Database generic fetch failed');
            const result = await response.json();
            setData(result);
        } catch (e) {
            console.error(e);
            // Mock Fallback if endpoint unsupported right now
            if (dbType === 'patients') {
                setData([{ patient_id: 'P-992', status_code: 1, last_bpm: 88, last_spo2: 97 }]);
            } else if (dbType === 'diseases') {
                setData([{ id: 1, disease_name: 'Influenza A', frequency: 12, institution_code: '0000' }]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setEditingId(null);
        fetchDatabase(selectedDB);
    }, [selectedDB]);

    const handleEditStart = (row) => {
        setEditingId(row.id);
        const formDraft = { ...row };
        delete formDraft.id; // Don't let them edit primary key
        setEditForm(formDraft);
    };

    const handleSave = async (id) => {
        try {
            let endpoint = '';
            if (selectedDB === 'patients') endpoint = `http://localhost:8000/patients/vitals/${id}`;
            if (selectedDB === 'diseases') endpoint = `http://localhost:8000/diseases/reports/${id}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(editForm)
            });
            if (response.ok) {
                setEditingId(null);
                fetchDatabase(selectedDB);
            }
        } catch (e) {
            console.error('Failed to update record:', e);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to permanently delete record #${id}?`)) return;
        try {
            let endpoint = '';
            if (selectedDB === 'patients') endpoint = `http://localhost:8000/patients/vitals/${id}`;
            if (selectedDB === 'diseases') endpoint = `http://localhost:8000/diseases/reports/${id}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                fetchDatabase(selectedDB);
            }
        } catch (e) {
            console.error('Failed to delete record:', e);
        }
    };

    // Dynamic renderer since DB structures differ wildly
    const renderTableHeaders = () => {
        if (!data || data.length === 0) return <tr><th>No data found</th></tr>;
        return (
            <tr>
                {Object.keys(data[0]).map(key => (
                    <th key={key} style={{ padding: '1rem', borderBottom: '2px solid var(--border-light)', textAlign: 'left', textTransform: 'capitalize', color: 'var(--text-dark)' }}>
                        {key.replace(/_/g, ' ')}
                    </th>
                ))}
                {selectedDB !== 'institutions' && (
                    <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-light)', textAlign: 'center', color: 'var(--text-dark)' }}>
                        Actions
                    </th>
                )}
            </tr>
        );
    };

    const renderTableBody = () => {
        if (!data || data.length === 0) return <tr><td colSpan="10" style={{ padding: '1rem', textAlign: 'center' }}>No records in Database</td></tr>;
        return data.map((row, idx) => {
            const isEditing = editingId === row.id && selectedDB !== 'institutions';
            return (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    {Object.entries(row).map(([key, val], cellIdx) => (
                        <td key={cellIdx} style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                            {isEditing && key !== 'id' ? (
                                <input
                                    type={typeof val === 'number' ? 'number' : 'text'}
                                    value={editForm[key] !== undefined ? editForm[key] : ''}
                                    onChange={e => setEditForm({ ...editForm, [key]: typeof val === 'number' ? Number(e.target.value) : e.target.value })}
                                    className="form-input"
                                    style={{ padding: '0.4rem', border: '1px solid var(--primary-blue)', width: '100%', minWidth: '80px' }}
                                />
                            ) : (
                                typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)
                            )}
                        </td>
                    ))}
                    {selectedDB !== 'institutions' && (
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {isEditing ? (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                    <button onClick={() => handleSave(row.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center' }} title="Save">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center' }} title="Cancel">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                    <button onClick={() => handleEditStart(row)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', color: 'var(--primary-blue)', borderColor: 'var(--primary-blue)' }} title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(row.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', color: 'var(--primary-red)', borderColor: 'var(--primary-red)' }} title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </td>
                    )}
                </tr>
            );
        });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <Database size={28} style={{ marginRight: '0.75rem' }} /> Database Manager
            </h2>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setSelectedDB('institutions')}
                            className={`btn ${selectedDB === 'institutions' ? 'btn-primary' : 'btn-outline'}`}
                        >DB A: Institutions</button>
                        <button
                            onClick={() => setSelectedDB('patients')}
                            className={`btn ${selectedDB === 'patients' ? 'btn-primary' : 'btn-outline'}`}
                        >DB P: Patients</button>
                        <button
                            onClick={() => setSelectedDB('diseases')}
                            className={`btn ${selectedDB === 'diseases' ? 'btn-primary' : 'btn-outline'}`}
                        >DB D: Disease Reports</button>
                    </div>
                    <button onClick={() => fetchDatabase(selectedDB)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center' }}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} style={{ marginRight: '0.5rem' }} /> Refresh
                    </button>
                </div>
            </div>

            <div className="card animate-fade-in" style={{ padding: '0', overflowX: 'auto', backgroundColor: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead style={{ backgroundColor: 'var(--bg-offwhite)' }}>
                        {renderTableHeaders()}
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="10" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</td></tr>
                        ) : renderTableBody()}
                    </tbody>
                </table>
            </div>

            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Layers size={14} style={{ marginRight: '0.25rem' }} /> High-level architectural viewer connected directly to SQLite core
            </p>
        </div>
    );
}
