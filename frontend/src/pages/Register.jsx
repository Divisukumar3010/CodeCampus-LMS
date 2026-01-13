import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🔹 ADDED STATES (minimal)
    const [passwordHint, setPasswordHint] = useState('');
    const [passwordHintColor, setPasswordHintColor] = useState('text-gray-600');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        });

        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        }
    };

    const getPasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
        if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4' };
        if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
        return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const validatePassword = (password) => {
        if (password.length === 0) {
            setPasswordHint('');
        } else if (password.length < 8) {
            setPasswordHint('Password must be at least 8 characters.');
            setPasswordHintColor('text-red-600');
        } else if (!/[A-Z]/.test(password)) {
            setPasswordHint('Password must contain at least one uppercase letter.');
            setPasswordHintColor('text-red-600');
        } else if (!/[a-z]/.test(password)) {
            setPasswordHint('Password must contain at least one lowercase letter.');
            setPasswordHintColor('text-red-600');
        } else if (!/[0-9]/.test(password)) {
            setPasswordHint('Password must contain at least one number.');
            setPasswordHintColor('text-red-600');
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setPasswordHint('Password must contain at least one special character.');
            setPasswordHintColor('text-red-600');
        } else {
            setPasswordHint('Strong password!');
            setPasswordHintColor('text-green-600');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                        <p className="mt-2 text-gray-600">Start your learning journey today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* NAME */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-10"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* ROLE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="student">Student</option>
                                <option value="trainer">Trainer</option>
                            </select>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => {
                                        handleChange(e);
                                        validatePassword(e.target.value);
                                    }}
                                    required
                                    className="input-field pl-10 pr-10"
                                    placeholder="••••••••"
                                />

                                {/* STRENGTH BAR */}


                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`
                                                    h-full
                                                    ${passwordStrength.color}
                                                    ${passwordStrength.width}
                                                    transition-all
                                                    duration-500
                                                    ease-in-out
                                                    rounded-full
                                                `}
                                        />
                                    </div>
                                    <p className="text-xs mt-1 text-gray-600">
                                        Strength: <span className="font-semibold">{passwordStrength.label}</span>
                                    </p>

                                    {/* PASSWORD RULE HINT */}
                                    {passwordHint && (
                                        <p className={`text-xs mt-1 ${passwordHintColor}`}>
                                            {passwordHint}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                />

                                {formData.confirmPassword && (
                                    <p
                                        className={`text-xs mt-1 ${formData.password === formData.confirmPassword
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}
                                    >
                                        {formData.password === formData.confirmPassword
                                            ? 'Passwords match'
                                            : 'Passwords do not match'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
