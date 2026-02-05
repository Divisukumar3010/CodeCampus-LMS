import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="w-full flex justify-center mt-5 mb-8 px-2 sm:px-3 md:px-4 lg:px-6">
            <div
                className="
      w-full max-w-[95%] md:max-w-[98%]
      rounded-2xl sm:rounded-3xl md:rounded-[3rem]
      bg-gray-900 dark:bg-gray-800 text-gray-300 dark:text-gray-400
      px-3 sm:px-6 md:px-8 lg:px-12
      py-6 sm:py-8 md:py-12 lg:py-16
    "
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10 auto-rows-max">
                    {/* Brand */}
                    <div className="col-span-1">
                        <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-4">CodeCampus
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base mb-4">
                            Empowering learners worldwide with quality education and expert instructors.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-blue-400 transition text-gray-400 hover:text-gray-300">
                                <FiFacebook size={20} />
                            </a>
                            <a href="#" className="hover:text-blue-400 transition text-gray-400 hover:text-gray-300">
                                <FiTwitter size={20} />
                            </a>
                            <a href="#" className="hover:text-blue-400 transition text-gray-400 hover:text-gray-300">
                                <FiLinkedin size={20} />
                            </a>
                            <a href="#" className="hover:text-blue-400 transition text-gray-400 hover:text-gray-300">
                                <FiInstagram size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h4 className="text-white text-sm sm:text-base md:text-lg font-semibold mb-4 sm:mb-6">Quick Links</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            <li>
                                <Link to="/courses" className="text-xs sm:text-sm md:text-base hover:text-blue-400 transition">
                                    Browse Courses
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-xs sm:text-sm md:text-base hover:text-blue-400 transition">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-xs sm:text-sm md:text-base hover:text-blue-400 transition">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="col-span-1">
                        <h4 className="text-white text-sm sm:text-base md:text-lg font-semibold mb-4 sm:mb-6">Support</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            <li>
                                <Link to="/help" className="text-xs sm:text-sm md:text-base hover:text-blue-400 transition">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-xs sm:text-sm md:text-base hover:text-blue-400 transition">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-xs sm:text-sm md:text-base hover:text-blue-400 transition">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                        <h4 className="text-white text-sm sm:text-base md:text-lg font-semibold mb-4 sm:mb-6">Newsletter</h4>
                        <p className="text-xs sm:text-sm md:text-base mb-4">
                            Subscribe to get updates on new courses
                        </p>
                        <div className="flex flex-col gap-2 w-full">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="
              px-3 sm:px-4 py-2 sm:py-3
              text-xs sm:text-sm
              rounded-lg
              bg-gray-800 dark:bg-gray-700 text-white
              placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              w-full
              box-border
            "
                            />
                            <button
                                className="
              px-4 sm:px-6 py-2 sm:py-3
              text-xs sm:text-sm
              bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700
              rounded-lg
              font-semibold
              transition
              w-full
              box-border
            "
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-gray-700 mt-6 sm:mt-8 md:mt-10 pt-4 sm:pt-6 text-center sm:text-left text-xs sm:text-sm">
                    <p>&copy; {new Date().getFullYear()} CodeCampus. All rights reserved.</p>
                </div>
            </div>
        </footer>

    );
};

export default Footer;