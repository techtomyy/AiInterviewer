import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Check, 
  Crown, 
  Users, 
  Video, 
  Brain,
  TrendingUp,
  Shield,
  HelpCircle,
  Star,
  Zap
} from "lucide-react";

export default function Subscribe() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '5 mock interviews per month',
        'Basic AI feedback',
        '50 practice questions',
        'Progress tracking',
        'Email support'
      ],
      current: user?.planType === 'free',
      popular: false,
      buttonText: 'Current Plan',
      disabled: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For serious job seekers',
      features: [
        'Unlimited mock interviews',
        'Advanced AI analysis',
        '1000+ practice questions',
        'Body language analysis',
        'Industry-specific questions',
        'Detailed progress reports',
        'Video download',
        'Priority support'
      ],
      current: user?.planType === 'pro',
      popular: true,
      buttonText: user?.planType === 'pro' ? 'Current Plan' : 'Coming Soon',
      disabled: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      period: 'per recruiter/month',
      description: 'For teams and organizations',
      features: [
        'All Pro features',
        'Candidate evaluation tools',
        'Team collaboration',
        'ATS integrations',
        'White-label options',
        'Custom branding',
        'Dedicated support',
        'SSO integration',
        'Advanced analytics'
      ],
      current: user?.planType === 'enterprise',
      popular: false,
      buttonText: 'Contact Sales',
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-neutral">Subscription Plans</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Current: {user?.planType || 'Free'}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral mb-6">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock your full potential with advanced AI coaching features and unlimited practice sessions.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'border-2 border-primary shadow-lg' : ''
              } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    <Check className="h-3 w-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  {plan.id === 'free' && <HelpCircle className="h-8 w-8 text-gray-500" />}
                  {plan.id === 'pro' && <Star className="h-8 w-8 text-primary" />}
                  {plan.id === 'enterprise' && <Crown className="h-8 w-8 text-purple-600" />}
                </div>
                <CardTitle className="text-2xl font-bold text-neutral mb-2">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-neutral mb-2">
                  {plan.price}
                  <span className="text-lg text-gray-600 font-normal">/{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-blue-800 text-white' 
                      : plan.current
                      ? 'bg-green-600 text-white cursor-default'
                      : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                  variant={plan.popular ? 'default' : plan.current ? 'default' : 'outline'}
                  disabled={plan.disabled}
                  onClick={() => {
                    if (plan.id === 'enterprise') {
                      // Contact sales flow
                      toast({
                        title: "Contact Sales",
                        description: "Our sales team will contact you within 24 hours.",
                      });
                    } else if (plan.id === 'pro' && !plan.current) {
                      toast({
                        title: "Coming Soon",
                        description: "Pro plan will be available soon!",
                      });
                    }
                  }}
                  data-testid={`button-${plan.id}-plan`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-neutral text-center mb-12">
            Feature Comparison
          </h3>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900">Pro</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-4 px-6 font-medium">Mock Interviews</td>
                      <td className="py-4 px-6 text-center">5/month</td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">AI Feedback</td>
                      <td className="py-4 px-6 text-center">Basic</td>
                      <td className="py-4 px-6 text-center">Advanced</td>
                      <td className="py-4 px-6 text-center">Advanced</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Question Bank</td>
                      <td className="py-4 px-6 text-center">50</td>
                      <td className="py-4 px-6 text-center">1000+</td>
                      <td className="py-4 px-6 text-center">1000+</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Body Language Analysis</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Progress Reports</td>
                      <td className="py-4 px-6 text-center">Basic</td>
                      <td className="py-4 px-6 text-center">Detailed</td>
                      <td className="py-4 px-6 text-center">Advanced</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Video Download</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Recruiter Tools</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Team Collaboration</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">ATS Integrations</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">✗</td>
                      <td className="py-4 px-6 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Support</td>
                      <td className="py-4 px-6 text-center">Email</td>
                      <td className="py-4 px-6 text-center">Priority</td>
                      <td className="py-4 px-6 text-center">Dedicated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-neutral mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h4 className="font-semibold text-neutral mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">Yes! Start with our free plan and upgrade when you're ready for more features.</p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral mb-2">How secure is my data?</h4>
              <p className="text-gray-600">We use enterprise-grade encryption and are GDPR compliant. Your data is always secure.</p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
