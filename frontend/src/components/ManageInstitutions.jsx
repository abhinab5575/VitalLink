import { useState, useEffect } from 'react';
import { Settings, Edit2, Trash2, Check, X } from 'lucide-react';

export default function ManageInstitutions() {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchInstitutions = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/auth/admin/institutions');
            if (!response.ok) throw new Error('Fetch failed');
            const data = await response.json();
            setInstitutions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const handleEditClick = (inst) => {
        setEditingId(inst.institution_code);
        setEditForm({
            email: inst.email,
            requires_password_change: inst.requires_password_change
        });
    };

    const handleSave = async (code) => {
        try {
            const response = await fetch(`http://localhost:8000/auth/admin/institutions/${code}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (response.ok) {
                setEditingId(null);
                fetchInstitutions();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (code) => {
        if (!window.confirm(`Are you sure you want to permanently delete institution ${code}?`)) return;
        try {
            const response = await fetch(`http://localhost:8000/auth/admin/institutions/${code}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchInstitutions();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <Settings size={28} style={{ marginRight: '0.75rem' }} /> Manage Institutions (DB A)
            </h2>

            <div className="card animate-fade-in" style={{ padding: '0', overflowX: 'auto', backgroundColor: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead style={{ backgroundColor: 'var(--bg-offwhite)' }}>
                        <tr>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>Institution Code</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>Requires Pwd Change</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid var(--border-light)', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</td></tr>
                        ) : (
                            institutions.map(inst => {
                                const isEditing = editingId === inst.institution_code;
                                return (
                                    <tr key={inst.institution_code} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: '1rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                                            {inst.institution_code}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                                    className="form-input"
                                                    style={{ padding: '0.4rem', border: '1px solid var(--primary-blue)' }}
                                                />
                                            ) : inst.email}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                            {isEditing ? (
                                                <select
                                                    value={editForm.requires_password_change ? 'true' : 'false'}
                                                    onChange={e => setEditForm(prev => ({ ...prev, requires_password_change: e.target.value === 'true' }))}
                                                    className="form-input"
                                                    style={{ padding: '0.4rem', border: '1px solid var(--primary-blue)' }}
                                                >
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                            ) : (inst.requires_password_change ? 'Yes' : 'No')}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                                    <button onClick={() => handleSave(inst.institution_code)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center' }}>
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center' }}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                                    <button onClick={() => handleEditClick(inst)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', color: 'var(--primary-blue)', borderColor: 'var(--primary-blue)' }}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(inst.institution_code)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', color: 'var(--primary-red)', borderColor: 'var(--primary-red)' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
