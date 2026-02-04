import { useEffect, useState } from 'react';
import { X, Shield, Mail, Instagram, Github } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // Show modal for READ_ONLY users who haven't seen it
    if (user?.role === 'read_only') {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setIsOpen(true);
      }
    }
  }, [user]);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Welcome to SQLPulse! 🎉</h2>
          </div>
          <p className="text-blue-100">Your account has been created successfully</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Access Level */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Your Current Access Level
            </h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium text-lg">🟢 Read-Only Access</p>
              <p className="text-gray-700 dark:text-gray-300">
                For security reasons, all new accounts start with <strong>Read-Only</strong> access. 
                This allows you to explore the platform safely.
              </p>
            </div>
          </div>

          {/* What You Can Do */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">✅ What You Can Do:</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                View shared queries and templates
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Browse execution history and results
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Explore dashboards and analytics
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Learn about database management features
              </li>
            </ul>
          </div>

          {/* Request Upgrade */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
              🚀 Need Full Access?
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              To create queries, execute SQL, and access advanced features, request an account upgrade to 
              <strong> Developer</strong> or <strong> Analyst</strong> access.
            </p>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Contact the admin:</p>
              
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://instagram.com/mahiiyh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition text-sm font-medium"
                >
                  <Instagram className="w-4 h-4" />
                  <span>@mahiiyh</span>
                </a>
                
                <a
                  href="https://github.com/mahiiyh/sqlpulse/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition text-sm font-medium"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Issues</span>
                </a>
                
                <a
                  href="mailto:contact@mahiiyh.me"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* Why This Policy */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <strong>Why this policy?</strong> SQLPulse is currently free. Default Read-Only access ensures 
            security and prevents unauthorized database access while we verify legitimate users.
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold"
          >
            Got it! Let's Explore
          </button>
        </div>
      </div>
    </div>
  );
}
