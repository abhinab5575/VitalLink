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

export default function Dashboard() {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'standard';

    // Default tab based on role
    const defaultTab = role === 'institution' ? 'pending' : role === 'admin' ? 'register' : 'dashboard';
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Update tab if role changes
    useEffect(() => {
        setActiveTab(defaultTab);
    }, [role]);

    const renderContent = () => {
        switch (activeTab) {
            case 'pending': return <PendingRequests />;
            case 'monitoring': return <RemoteMonitoring />;
            case 'report': return <DiseaseReport />;
            case 'dashboard': return <DiseaseDashboard />;
            case 'map': return <DiseaseDashboard />; // Re-use dashboard for admin map view for now
            case 'register': return <RegisterInstitution />;
            case 'anomaly': return <AnomalyDetection />;
            case 'models': return <ModelPredictions />;
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
            <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} />

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
