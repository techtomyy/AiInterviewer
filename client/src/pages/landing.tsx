import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, 
  Brain, 
  TrendingUp, 
  Users, 
  Shield, 
  HelpCircle, 
  Video, 
  Check,
  Play,
  Star,
  Eye,
  BarChart3,
  LogIn,
  LogOut
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/suppabaseClient";

export default function Landing() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    window.location.href = "/auth";
  };

  const handleSignIn = () => {
    window.location.href = "/auth";
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDashboard = () => {
    if (user) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/auth";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Mic className="text-primary h-8 w-8 mr-3" />
                <span className="text-xl font-bold text-neutral">AI Interview Coach</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors duration-300">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors duration-300">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-colors duration-300">Contact</a>
              
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={handleDashboard}
                    className="text-primary hover:text-blue-800 transition-colors duration-300 font-medium"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="text-primary hover:text-blue-800 transition-colors duration-300 font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignIn}
                    className="text-primary hover:text-blue-800 transition-colors duration-300 font-medium"
                    data-testid="button-signin"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-primary hover:bg-blue-800 text-white font-medium"
                    data-testid="button-getstarted"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-neutral mb-6 leading-tight">
                Master Your Next
                <span className="text-primary block">Interview</span>
                with AI
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Practice with our AI-powered coach, get real-time feedback on your communication skills, 
                and land your dream job with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={handleDashboard}
                  className="bg-primary hover:bg-blue-800 text-white px-8 py-4 text-lg font-semibold"
                  data-testid="button-start-trial"
                >
                  Start Free Trial
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg font-semibold"
                  data-testid="button-watch-demo"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="aspect-video bg-gray-900 rounded-xl mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-800">AI Analysis in Progress...</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-3/4 transition-all duration-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI technology with proven interview 
              techniques to give you the competitive edge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Video className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral mb-4">Smart Video Recording</h3>
                <p className="text-gray-600 leading-relaxed">
                  Record practice interviews with our advanced WebRTC technology. Get instant playback 
                  with synchronized AI analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Brain className="text-secondary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral mb-4">AI-Powered Feedback</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get detailed analysis of your speech patterns, body language, and answer quality 
                  with actionable improvement suggestions.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="text-accent h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral mb-4">Progress Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor your improvement over time with detailed analytics and personalized 
                  recommendations for continued growth.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <HelpCircle className="text-purple-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral mb-4">Question Bank</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access hundreds of industry-specific questions across tech, finance, marketing, 
                  and more. Practice with real interview scenarios.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                  <Users className="text-red-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral mb-4">Recruiter Tools</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced candidate evaluation tools for HR professionals with objective 
                  scoring and comparison dashboards.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="text-indigo-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral mb-4">Secure & Private</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enterprise-grade security with end-to-end encryption. GDPR compliant with 
                  full data control and deletion rights.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Demo Section */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-neutral mb-6">
                  See AI Analysis in Action
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  Watch how our AI provides instant feedback on speech clarity, body language, 
                  and content structure to help you improve.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <Check className="text-white h-4 w-4" />
                    </div>
                    <span className="text-gray-700">Real-time speech-to-text transcription</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <Check className="text-white h-4 w-4" />
                    </div>
                    <span className="text-gray-700">Body language and eye contact analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <Check className="text-white h-4 w-4" />
                    </div>
                    <span className="text-gray-700">Content relevance scoring</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Card className="p-6">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="text-primary h-16 w-16 mx-auto mb-4" />
                      <p className="text-gray-600">Live Analytics Dashboard</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and upgrade as you grow. All plans include our core AI coaching features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="relative">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-neutral mb-2">Free</h3>
                  <div className="text-4xl font-bold text-neutral mb-2">$0</div>
                  <p className="text-gray-600">Perfect for getting started</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">5 mock interviews per month</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">Basic AI feedback</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">50 practice questions</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">Progress tracking</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleDashboard}
                  data-testid="button-free-plan"
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-primary shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-neutral mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-neutral mb-2">$29</div>
                  <p className="text-gray-600">per month</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">Unlimited mock interviews</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">Advanced AI analysis</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">1000+ practice questions</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">Body language analysis</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">Industry-specific questions</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">Detailed progress reports</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-blue-800 text-white"
                  onClick={handleDashboard}
                  data-testid="button-pro-plan"
                >
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-neutral mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-neutral mb-2">$99</div>
                  <p className="text-gray-600">per recruiter/month</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">All Pro features</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">Candidate evaluation tools</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">Team collaboration</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">ATS integrations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">White-label options</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="text-secondary h-5 w-5" />
                    <span className="text-gray-700">24/7 priority support</span>
                  </li>
                </ul>
                <Button 
                  variant="outline"
                  className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  data-testid="button-enterprise-plan"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <Mic className="text-primary h-8 w-8 mr-3" />
                <span className="text-xl font-bold">AI Interview Coach</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering candidates and recruiters with AI-driven interview insights and coaching.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors duration-300">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6">Resources</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Best Practices</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 AI Interview Coach. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>🔒 Enterprise Security</span>
                <span>🌍 GDPR Compliant</span>
                <span>⚡ 99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
