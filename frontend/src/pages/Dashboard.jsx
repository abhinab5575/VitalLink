import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PendingRequests from '../components/PendingRequests';
import RemoteMonitoring from '../components/RemoteMonitoring';
import DiseaseReport from '../components/DiseaseReport';
import DiseaseDashboard from '../components/DiseaseDashboard';
import RegisterInstitution from '../components/RegisterInstitution';
import AnomalyDetection from '../components/AnomalyDetection';
import ModelPredictions from '../components/ModelPredictions';
import Settings from '../components/Settings';
import ManageDatabases from '../components/ManageDatabases';
import ManageInstitutions from '../components/ManageInstitutions';
import { AlertCircle } from 'lucide-react';

export default function Dashboard() {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'standard';

    // Default tab based on role
    const defaultTab = role === 'institution' ? 'pending' : role === 'admin' ? 'register' : 'dashboard';
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [showToast, setShowToast] = useState(false);

    const isLocked = localStorage.getItem('requires_password_change') === 'true';

    // Update tab if role changes or if locked
    useEffect(() => {
        if (isLocked) {
            setActiveTab('settings');
            setShowToast(true); // Now using this as a modal 
        } else {
            setActiveTab(defaultTab);
            setShowToast(false);
        }
    }, [role, isLocked]);

    const renderContent = () => {
        switch (activeTab) {
            case 'pending': return <PendingRequests />;
            case 'monitoring': return <RemoteMonitoring />;
            case 'report': return <DiseaseReport />;
            case 'dashboard': return <DiseaseDashboard />;
            case 'map': return <DiseaseDashboard />; // Re-use dashboard for admin map view for now
            case 'register': return <RegisterInstitution />;
            case 'manage_inst': return <ManageInstitutions />;
            case 'manage_db': return <ManageDatabases />;
            case 'anomaly': return <AnomalyDetection />;
            case 'models': return <ModelPredictions />;
            case 'settings': return <Settings role={role} />;
            default:
                return (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white' }}>
                        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>
                            Feature Under Construction
                        </h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                            This module ({activeTab}) is currently being integrated.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-offwhite)' }}>
            {/* Fixed Sidebar */}
            <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} isLocked={isLocked} />

            {/* Temporary Password Modal */}
            {showToast && (
                <div className="animate-fade-in" style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="card" style={{ backgroundColor: 'var(--bg-white)', padding: '2.5rem', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderTop: '4px solid var(--primary-red)' }}>
                        <AlertCircle color="var(--primary-red)" size={56} style={{ marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Action Required</h3>
                        <p style={{ margin: '0 0 2rem 0', color: 'var(--text-muted)' }}>You have logged in with a temporary auto-generated password. You must configure a new, secure password before accessing your workspace.</p>
                        <button onClick={() => setShowToast(false)} className="btn btn-primary" style={{ width: '100%' }}>Proceed to Settings</button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="animate-fade-in" style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ color: 'var(--primary-blue)', textTransform: 'capitalize' }}>{activeTab.replace('_', ' ')}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Real-time updates and controls.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.5rem 1rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', fontWeight: 500 }}>
                            {role.toUpperCase()}
                        </div>
                    </div>
                </header>

                {renderContent()}
            </main>
        </div>
    );
}
