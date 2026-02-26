import { useState } from 'react';
import { Building2, Save } from 'lucide-react';

export default function RegisterInstitution() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        latitude: '',
        longitude: '',
        state: ''
    });

    const [generatedCode, setGeneratedCode] = useState('');
    const [generatedPwd, setGeneratedPwd] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        // In real app, call backend /auth/register and /diseases/location
        const code = 'INST-' + Math.floor(1000 + Math.random() * 9000);
        const pwd = Math.random().toString(36).slice(-8);
        setGeneratedCode(code);
        setGeneratedPwd(pwd);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>Register New Partner Institution</h2>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <form onSubmit={handleRegister}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Institution Name</label>
                            <input type="text" className="form-input" placeholder="e.g. City General Hospital" required
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Contact Email</label>
                            <input type="email" className="form-input" placeholder="admin@hospital.com" required
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Latitude</label>
                            <input type="number" step="any" className="form-input" placeholder="e.g. 34.0522" required
                                value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Longitude</label>
                            <input type="number" step="any" className="form-input" placeholder="e.g. -118.2437" required
                                value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">State Code</label>
                            <input type="text" className="form-input" placeholder="e.g. CA" required
                                value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center' }}>
                        <Save size={18} style={{ marginRight: '0.5rem' }} /> Create Institution Profile
                    </button>
                </form>
            </div>

            {generatedCode && (
                <div className="card animate-fade-in" style={{ padding: '2rem', backgroundColor: 'var(--primary-blue)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <Building2 size={24} style={{ marginRight: '1rem', color: 'var(--accent-blue)' }} />
                        <h3 style={{ margin: 0 }}>Registration Successful</h3>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
                        The institution has been registered in Database A and Database D. Provide them with the following credentials to login to the portal.
                    </p>

                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                        <p style={{ margin: '0 0 0.5rem 0' }}><strong>Institution Code:</strong> {generatedCode}</p>
                        <p style={{ margin: 0 }}><strong>Temporary Password:</strong> <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{generatedPwd}</span></p>
                    </div>
                </div>
            )}
        </div>
    );
}
