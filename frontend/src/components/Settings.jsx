import { useState } from 'react';
import { ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function Settings({ role }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            // Decode JWT safely (very basic decode for frontend username extraction)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const institution_code = JSON.parse(jsonPayload).sub;

            const response = await fetch('http://localhost:8000/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    institution_code: institution_code,
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });

            if (!response.ok) {
                throw new Error('Incorrect old password or failed request');
            }

            setMessage('Password successfully updated!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Remove flags locking the user into settings
            localStorage.removeItem('requires_password_change');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>
                <KeyRound size={28} style={{ marginRight: '0.75rem' }} />
                <h2 style={{ margin: 0 }}>Account Settings</h2>
            </div>

            {localStorage.getItem('requires_password_change') === 'true' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'rgba(230, 57, 70, 0.1)', color: 'var(--primary-red)', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', fontWeight: 500 }}>
                    <ShieldAlert size={24} />
                    <span>For security reasons, you must change your auto-generated temporary password before accessing your dashboard.</span>
                </div>
            )}

            <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Change Password</h3>

                    {error && <div style={{ color: 'var(--primary-red)', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>{error}</div>}
                    {message && <div style={{ color: '#2a9d8f', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>{message}</div>}

                    <div className="form-group">
                        <label className="form-label">Current / Temporary Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showOldPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Enter current password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                            >
                                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary">Update Password</button>
                </div>
            </form>
        </div>
    );
}
