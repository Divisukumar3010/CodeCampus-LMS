import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="w-full flex justify-center mt-5 mb-8">
            <div
                className="
      w-full max-w-[98%]
      mx-2
      rounded-[3rem]
      bg-gray-900 text-gray-300
      px-6 sm:px-12
      py-9
    "
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-white text-xl font-bold mb-4">CodeCampus
</h3>
                        <p className="text-sm mb-4">
                            Empowering learners worldwide with quality education and expert instructors.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-primary-400 transition">
                                <FiFacebook size={20} />
                            </a>
                            <a href="#" className="hover:text-primary-400 transition">
                                <FiTwitter size={20} />
                            </a>
                            <a href="#" className="hover:text-primary-400 transition">
                                <FiLinkedin size={20} />
                            </a>
                            <a href="#" className="hover:text-primary-400 transition">
                                <FiInstagram size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/courses" className="hover:text-primary-400 transition">
                                    Browse Courses
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-primary-400 transition">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-primary-400 transition">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/help" className="hover:text-primary-400 transition">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-primary-400 transition">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-primary-400 transition">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Newsletter</h4>
                        <p className="text-sm mb-4">
                            Subscribe to get updates on new courses
                        </p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="
              px-4 py-3
              rounded-l-xl
              bg-gray-800 text-white
              focus:outline-none focus:ring-2 focus:ring-primary-500
              flex-grow
            "
                            />
                            <button
                                className="
              px-6 py-3
              bg-primary-600 hover:bg-primary-700
              rounded-r-xl
              font-semibold
              transition
            "
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} CodeCampus. All rights reserved.</p>
                </div>
            </div>
        </footer>

    );
};

export default Footer;