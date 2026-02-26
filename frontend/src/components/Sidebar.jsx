import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Settings, Database, Server, LogOut, Map, AlertTriangle } from 'lucide-react';

export default function Sidebar({ role, activeTab, setActiveTab }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <aside style={{
            width: '260px',
            backgroundColor: 'var(--primary-blue)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            boxShadow: 'var(--shadow-md)',
            position: 'fixed'
        }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>VitalLink</h2>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
                    {role} Portal
                </span>
            </div>

            <nav style={{ flex: 1, padding: '1.5rem 0', overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>

                    {role === 'institution' && (
                        <>
                            <NavItem onClick={() => setActiveTab('pending')} icon={<Users size={20} />} label="Pending Requests" active={activeTab === 'pending'} />
                            <NavItem onClick={() => setActiveTab('monitoring')} icon={<Activity size={20} />} label="Remote Monitoring" active={activeTab === 'monitoring'} />
                            <NavItem onClick={() => setActiveTab('report')} icon={<LayoutDashboard size={20} />} label="Disease Report" active={activeTab === 'report'} />
                            <NavItem onClick={() => setActiveTab('dashboard')} icon={<Map size={20} />} label="Disease Dashboard" active={activeTab === 'dashboard'} />
                        </>
                    )}

                    {role === 'admin' && (
                        <>
                            <NavItem onClick={() => setActiveTab('register')} icon={<Users size={20} />} label="Register Institution" active={activeTab === 'register'} />
                            <NavItem onClick={() => setActiveTab('manage_inst')} icon={<Settings size={20} />} label="Manage Institutions" active={activeTab === 'manage_inst'} />
                            <NavItem onClick={() => setActiveTab('manage_db')} icon={<Database size={20} />} label="Manage Databases" active={activeTab === 'manage_db'} />
                            <NavItem onClick={() => setActiveTab('models')} icon={<Server size={20} />} label="Model Predictions" active={activeTab === 'models'} />
                            <NavItem onClick={() => setActiveTab('anomaly')} icon={<AlertTriangle size={20} />} label="Anomaly Detection" active={activeTab === 'anomaly'} />
                            <NavItem onClick={() => setActiveTab('map')} icon={<Map size={20} />} label="Disease Map" active={activeTab === 'map'} />
                        </>
                    )}

                    {role === 'standard' && (
                        <>
                            <NavItem onClick={() => setActiveTab('dashboard')} icon={<Map size={20} />} label="Disease Dashboard" active={activeTab === 'dashboard'} />
                        </>
                    )}

                </ul>
            </nav>

            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {(role === 'institution' || role === 'admin') && (
                    <button onClick={() => setActiveTab('settings')} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', width: '100%', marginBottom: '1rem' }}>
                        <Settings size={18} style={{ marginRight: '0.5rem' }} /> Settings
                    </button>
                )}
                <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'transparent', color: 'var(--primary-red)', border: '1px solid var(--primary-red)', width: '100%' }}>
                    <LogOut size={18} style={{ marginRight: '0.5rem' }} /> Logout
                </button>
            </div>
        </aside>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <li>
            <div onClick={onClick} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.8rem 1.5rem',
                color: active ? 'white' : 'rgba(255,255,255,0.7)',
                backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: active ? '4px solid var(--primary-red)' : '4px solid transparent',
                transition: 'all 0.2s',
                cursor: 'pointer'
            }}>
                <span style={{ marginRight: '1rem', display: 'flex' }}>{icon}</span>
                <span style={{ fontSize: '0.95rem' }}>{label}</span>
            </div>
        </li>
    );
}
