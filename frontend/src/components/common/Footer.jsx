import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiGithub } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-slate-100 dark:bg-[#060913] border-t border-slate-200/50 dark:border-white/[0.04] pt-16 pb-12 text-slate-600 dark:text-slate-400 transition-colors relative" data-purpose="page-footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-slate-800/70">
                    {/* Brand & Newsletter */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="flex items-center gap-3">
                            <img
                                src="/CodeCampus.png"
                                alt="CodeCampus Logo"
                                className="w-9 h-9 object-contain"
                            />
                            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Code<span className="text-indigo-600 dark:text-indigo-400">Campus</span>
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                            Empowering students, developers, and global enterprise engineers with career-defining technical competencies, cloud sandbox tooling, and verified certifications.
                        </p>
                        <div className="pt-2">
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Subscribe to Engineering Weekly</div>
                            <form onSubmit={(e) => { e.preventDefault(); }} className="flex items-center gap-2 max-w-sm">
                                <input
                                    className="bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 shadow-sm"
                                    placeholder="Enter your email"
                                    type="email"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-sm"
                                >
                                    Join
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300 mb-4">Platform</h4>
                        <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    Courses Catalog
                                </Link>
                            </li>
                            <li>
                                <Link to="/online-compiler" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    Online Compiler
                                </Link>
                            </li>
                            <li>
                                <Link to="/calendar" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    Academic Calendar
                                </Link>
                            </li>
                            <li>
                                <Link to="/grades" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    Grades & Transcripts
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300 mb-4">Resources</h4>
                        <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                                    Student Community
                                </a>
                            </li>
                            <li>
                                <Link to="/courses" className="hover:text-white transition-colors">
                                    Accreditation
                                </Link>
                            </li>
                            <li>
                                <Link to="/courses" className="hover:text-white transition-colors">
                                    Faculty Directory
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="hover:text-white transition-colors">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Institutional & Legal */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300 mb-4">Institutional</h4>
                        <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    Curriculum Terms
                                </Link>
                            </li>
                            <li>
                                <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    Compliance & SOC2
                                </Link>
                            </li>
                            <li>
                                <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    Support Desk
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-500 gap-4">
                    <div>
                        © {new Date().getFullYear()} CodeCampus LMS Inc. All rights reserved. Learn Without Limits.
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            All Systems Operational (99.98%)
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;