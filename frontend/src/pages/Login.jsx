import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState('standard'); // 'standard', 'institution', 'admin'
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (role === 'standard') {
            navigate('/dashboard?role=standard');
            return;
        }

        try {
            const username = role === 'admin' ? 'admin' : code;
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            navigate(`/dashboard?role=${role}`);
        } catch (err) {
            setError('Authentication failed. Please check your credentials.');
        }
    };

    return (
        <div className="login-container animate-fade-in" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-offwhite)' }}>
            {/* Left side: Image */}
            <div className="login-image-panel" style={{ flex: '1 1 50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-white)', padding: '2rem' }}>
                <img
                    src="/login-image.jpeg"
                    alt="VitalLink"
                    style={{ maxWidth: '80%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}
                />
            </div>

            {/* Right side: Login Form */}
            <div className="login-form-panel" style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 8rem', backgroundColor: 'var(--primary-blue)', color: 'white' }}>
                <div className="card" style={{ padding: '3rem', backgroundColor: 'var(--bg-white)', color: 'var(--text-dark)' }}>
                    <h1 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>VitalLink</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sign in to continue to your dashboard.</p>

                    {error && (
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(230, 57, 70, 0.1)', color: 'var(--primary-red)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                            {error}
                        </div>
                    )}

                    {/* Role Selector Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            className={`btn ${role === 'standard' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ flex: 1, padding: '0.5rem' }}
                            onClick={() => setRole('standard')}
                        >Standard</button>

                        <button
                            className={`btn ${role === 'institution' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ flex: 1, padding: '0.5rem' }}
                            onClick={() => setRole('institution')}
                        >Institution</button>

                        <button
                            className={`btn ${role === 'admin' ? 'btn-danger' : 'btn-outline'}`}
                            style={{ flex: 1, padding: '0.5rem' }}
                            onClick={() => setRole('admin')}
                        >Admin</button>
                    </div>

                    <form onSubmit={handleLogin}>

                        {role === 'institution' && (
                            <div className="form-group">
                                <label className="form-label">Institution Code</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter code"
                                    required
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                />
                            </div>
                        )}

                        {(role === 'institution' || role === 'admin') && (
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />

                                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                    <a href="#" style={{ fontSize: '0.85rem' }}>Forgot password?</a>
                                </div>
                            </div>
                        )}

                        <button type="submit" className={`btn ${role === 'admin' ? 'btn-danger' : 'btn-primary'}`} style={{ width: '100%', marginTop: '1rem' }}>
                            {role === 'standard' ? 'Continue to Dashboard' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
