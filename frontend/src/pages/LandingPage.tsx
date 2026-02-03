import { Link } from 'react-router-dom';
import { 
  Database, 
  Zap, 
  Shield, 
  GitBranch, 
  Clock, 
  BarChart3, 
  Code2, 
  Server,
  CheckCircle2,
  ArrowRight,
  Play,
  BookOpen,
  Users,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Database className="w-8 h-8" />,
      title: 'Multi-Database Support',
      description: 'Connect to PostgreSQL, MySQL, SQL Server, and more. Manage all your databases from one unified interface.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Smart Query Scheduling',
      description: 'Schedule queries with cron expressions. Automatic retries, parallel execution, and intelligent job queue management.'
    },
    {
      icon: <Code2 className="w-8 h-8" />,
      title: 'Advanced Query Editor',
      description: 'Syntax highlighting, auto-completion, and parameterized queries. Write better SQL faster with our powerful editor.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Real-time Analytics',
      description: 'Monitor query performance, execution history, and success rates. Visualize trends with interactive charts.'
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: 'Version Control',
      description: 'Track query changes, maintain history, and collaborate with your team using built-in version control.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'Role-based access control, encrypted connections, and audit logs. Keep your data secure and compliant.'
    }
  ];

  const benefits = [
    {
      title: 'Save Hours Every Week',
      description: 'Automate repetitive database tasks and focus on what matters. Schedule reports, data syncs, and maintenance tasks effortlessly.'
    },
    {
      title: 'Reduce Errors',
      description: 'Eliminate manual mistakes with automated validation, testing, and execution. Get notified instantly when something goes wrong.'
    },
    {
      title: 'Scale Effortlessly',
      description: 'Handle thousands of scheduled queries with our distributed job queue. Built for teams and enterprises.'
    },
    {
      title: 'Collaborate Better',
      description: 'Share queries, templates, and best practices across your team. Built-in permissions and user management.'
    }
  ];

  const guides = [
    {
      title: 'Getting Started',
      description: 'Set up your first database connection and run your first query in under 5 minutes.',
      icon: <Play className="w-5 h-5" />,
      link: '#quick-start'
    },
    {
      title: 'Query Scheduling',
      description: 'Learn how to schedule recurring queries using cron expressions and manage automated workflows.',
      icon: <Clock className="w-5 h-5" />,
      link: '#scheduling-guide'
    },
    {
      title: 'API Integration',
      description: 'Integrate SQLPulse into your applications using our RESTful API and webhooks.',
      icon: <Server className="w-5 h-5" />,
      link: '#api-docs'
    },
    {
      title: 'Team Collaboration',
      description: 'Set up user roles, permissions, and shared query libraries for your team.',
      icon: <Users className="w-5 h-5" />,
      link: '#team-guide'
    }
  ];

  const useCases = [
    'Automated data reporting and exports',
    'Scheduled database backups and maintenance',
    'ETL processes and data synchronization',
    'Real-time alerting and monitoring',
    'Compliance reporting and audit trails',
    'Cross-database queries and analytics'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-2">
                <Database className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SQLPulse</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Benefits</a>
              <a href="#guides" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Guides</a>
              <a href="#use-cases" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Use Cases</a>
            </div>
            <Link 
              to="/login" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Now in Production · sqlpulse.io</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Automate Your SQL
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Queries & Schedules
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            The modern SQL query management platform for developers and teams. 
            Schedule, execute, and monitor database queries across all your environments.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/login" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition inline-flex items-center justify-center space-x-2"
            >
              <span>Start Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features" 
              className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-lg font-semibold text-lg transition inline-flex items-center justify-center space-x-2"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">10k+</div>
              <div className="text-gray-600 dark:text-gray-400">Queries/day</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">5ms</div>
              <div className="text-gray-600 dark:text-gray-400">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-400">Open Source</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A complete platform for managing, scheduling, and monitoring SQL queries across your entire data infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition group"
              >
                <div className="text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Teams Choose SQLPulse
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Stop wasting time on manual database tasks. Let SQLPulse automate your workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-lg flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Built for Modern Data Teams
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Whether you're a solo developer or an enterprise team, SQLPulse scales with your needs.
              </p>
              
              <div className="space-y-4">
                {useCases.map((useCase, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-lg">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-400">Scheduled Query</span>
                  </div>
                  <code className="text-sm text-gray-300">
                    SELECT * FROM users WHERE created_at &gt; NOW() - INTERVAL '1 day'
                  </code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Next run: 5 minutes</span>
                  <span className="text-green-400">● Active</span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Execution Stats</span>
                    <span className="text-sm text-green-400">99.8% success</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Total runs</span>
                      <span className="text-gray-300">1,247</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Avg duration</span>
                      <span className="text-gray-300">124ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section id="guides" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              <span>Documentation & Guides</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Learn & Explore
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to master SQLPulse, from quick starts to advanced workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <a
                key={index}
                href={guide.link}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-lg text-primary-600 dark:text-primary-400 group-hover:scale-110 transition">
                      {guide.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                        {guide.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {guide.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition" />
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a 
              href="https://github.com/mahiiyh/sqlpulse" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              <span>View full documentation on GitHub</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Automate Your SQL?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join developers and teams using SQLPulse to streamline their database workflows.
          </p>
          <Link 
            to="/login" 
            className="bg-white hover:bg-gray-100 text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition inline-flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-primary-200 text-sm mt-4">
            No credit card required · Free tier available · Open source
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-2">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SQLPulse</span>
              </div>
              <p className="text-sm text-gray-400">
                Modern SQL query management and scheduling platform.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
                <li><a href="#use-cases" className="hover:text-white transition">Use Cases</a></li>
                <li><Link to="/login" className="hover:text-white transition">Get Started</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#guides" className="hover:text-white transition">Documentation</a></li>
                <li><a href="https://github.com/mahiiyh/sqlpulse" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a></li>
                <li><a href="#api-docs" className="hover:text-white transition">API Reference</a></li>
                <li><a href="#guides" className="hover:text-white transition">Guides</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/mahiiyh/sqlpulse/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Report Issue</a></li>
                <li><a href="https://github.com/mahiiyh/sqlpulse/discussions" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Community</a></li>
                <li><a href="#quick-start" className="hover:text-white transition">Quick Start</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center text-gray-400">
            <p>© 2026 SQLPulse. Open source under MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
