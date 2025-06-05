import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Car, MessageSquare, FileText, Users, BarChart3 } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl w-fit mx-auto mb-4">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Motix Garage...</h2>
        </div>
      </div>
    );
  }

  if (user && profile) {
    return <Dashboard userRole={profile.role as 'client' | 'workshop'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
              <Car className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Motix Garage
              </h1>
              <p className="text-sm text-slate-600">Smart Automotive Management</p>
            </div>
          </div>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
            Transform Your Auto Repair
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Business Today
            </span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Streamline operations, enhance customer communication, and grow your automotive repair business 
            with our comprehensive SaaS platform designed for modern workshops and clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-3"
              >
                Start Free Trial
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3 border-slate-300 hover:bg-slate-50"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">
            Everything You Need to Succeed
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From appointment scheduling to AI-powered insights, our platform covers every aspect of automotive repair management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Smart Scheduling</CardTitle>
              <CardDescription>
                Intelligent appointment booking with real-time availability and automated reminders.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Real-time Chat</CardTitle>
              <CardDescription>
                WhatsApp-style communication with automatic translation for global customers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Smart Quotations</CardTitle>
              <CardDescription>
                Generate professional quotes with dynamic pricing and approval workflows.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                <Car className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Vehicle Management</CardTitle>
              <CardDescription>
                Complete vehicle profiles with service history and maintenance tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Analytics & Insights</CardTitle>
              <CardDescription>
                AI-powered analytics to optimize operations and improve customer satisfaction.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Multi-Tenant</CardTitle>
              <CardDescription>
                Secure multi-tenant architecture with role-based access control.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of workshops already using Motix Garage to streamline their operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-blue-50"
                >
                  Start Your Free Trial
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-3 border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold">Motix Garage</h4>
              </div>
              <p className="text-slate-400">
                Revolutionizing automotive repair management with smart technology.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-slate-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-slate-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-slate-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Status</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Motix Garage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
