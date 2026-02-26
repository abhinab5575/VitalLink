import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState('standard'); // 'standard', 'institution', 'admin'
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Forgot Password States
    const [showForgotForm, setShowForgotForm] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);

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
            if (data.requires_password_change) {
                localStorage.setItem('requires_password_change', 'true');
            } else {
                localStorage.removeItem('requires_password_change');
            }
            navigate(`/dashboard?role=${role}`);
        } catch (err) {
            setError('Authentication failed. Please check your credentials.');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (cooldown > 0) return;

        try {
            const username = role === 'admin' ? 'admin' : code;
            const payload = {
                institution_code: username,
                email: resetEmail
            };

            const response = await fetch('http://localhost:8000/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to reset password');
            }

            const data = await response.json();
            setError(data.status || 'A new password has been sent to the linked email. Please attempt logging in using it.');
            setResetEmail('');

            setCooldown(90);
            const interval = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            setTimeout(() => {
                setShowForgotForm(false);
                setError('');
            }, 5000);

        } catch (err) {
            setError(err.message);
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
                    {!showForgotForm && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                className={`btn ${role === 'standard' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ flex: 1, padding: '0.5rem' }}
                                onClick={() => { setRole('standard'); setShowForgotForm(false); }}
                            >Standard</button>

                            <button
                                className={`btn ${role === 'institution' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ flex: 1, padding: '0.5rem' }}
                                onClick={() => { setRole('institution'); setShowForgotForm(false); }}
                            >Institution</button>

                            <button
                                className={`btn ${role === 'admin' ? 'btn-danger' : 'btn-outline'}`}
                                style={{ flex: 1, padding: '0.5rem' }}
                                onClick={() => { setRole('admin'); setShowForgotForm(false); }}
                            >Admin</button>
                        </div>
                    )}

                    {showForgotForm ? (
                        <form onSubmit={handleForgotPassword} className="animate-fade-in">
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Reset Password</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Enter your registered {role === 'admin' ? 'administrative' : 'institution'} email and a new password to reset your credentials.
                            </p>

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
                                        disabled={role === 'admin'}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Registered Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    required
                                    value={resetEmail}
                                    onChange={e => setResetEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '1rem', opacity: cooldown > 0 ? 0.7 : 1, cursor: cooldown > 0 ? 'not-allowed' : 'pointer' }}
                                disabled={cooldown > 0}
                            >
                                {cooldown > 0 ? `Wait ${cooldown}s` : 'Reset Password'}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowForgotForm(false); setError(''); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="animate-fade-in">
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
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-input"
                                            placeholder="Enter password"
                                            required
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            style={{ paddingRight: '2.5rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => { setShowForgotForm(true); setError(''); }}
                                            style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className={`btn ${role === 'admin' ? 'btn-danger' : 'btn-primary'}`} style={{ width: '100%', marginTop: '1rem' }}>
                                {role === 'standard' ? 'Continue to Dashboard' : 'Sign In'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
