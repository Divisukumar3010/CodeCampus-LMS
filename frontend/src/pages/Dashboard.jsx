import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import TrainerDashboard from '../components/dashboard/TrainerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import Loader from '../components/common/Loader';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    const renderDashboard = () => {
        switch (user?.role) {
            case 'student':
                return <StudentDashboard />;
            case 'trainer':
                return <TrainerDashboard />;
            case 'admin':
                return <AdminDashboard />;
            default:
                return <div>Invalid user role</div>;
        }
    };

    return <div className="min-h-screen bg-gray-50 dark:bg-slate-950">{renderDashboard()}</div>;
};

export default Dashboard;