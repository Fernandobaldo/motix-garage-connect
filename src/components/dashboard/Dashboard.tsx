
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Car, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Bell, 
  Search,
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import ServiceScheduling from "./ServiceScheduling";
import ChatInterface from "./ChatInterface";
import QuotationManager from "./QuotationManager";

interface DashboardProps {
  userRole: 'client' | 'workshop';
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const clientStats = [
    { title: "Upcoming Services", value: "2", icon: Calendar, color: "blue" },
    { title: "My Vehicles", value: "3", icon: Car, color: "green" },
    { title: "Active Chats", value: "1", icon: MessageSquare, color: "purple" },
    { title: "Pending Quotes", value: "2", icon: FileText, color: "orange" },
  ];

  const workshopStats = [
    { title: "Today's Appointments", value: "8", icon: Calendar, color: "blue" },
    { title: "Active Projects", value: "12", icon: Car, color: "green" },
    { title: "Pending Quotes", value: "5", icon: FileText, color: "orange" },
    { title: "Total Clients", value: "156", icon: Users, color: "purple" },
  ];

  const stats = userRole === 'client' ? clientStats : workshopStats;

  const recentActivities = userRole === 'client' ? [
    { id: 1, type: "service", title: "Oil Change Completed", time: "2 hours ago", status: "completed" },
    { id: 2, type: "quote", title: "Brake Repair Quote Received", time: "1 day ago", status: "pending" },
    { id: 3, type: "appointment", title: "Engine Check Scheduled", time: "2 days ago", status: "upcoming" },
  ] : [
    { id: 1, type: "appointment", title: "New appointment booked", time: "1 hour ago", status: "new" },
    { id: 2, type: "chat", title: "Message from John Doe", time: "2 hours ago", status: "unread" },
    { id: 3, type: "quote", title: "Quote approved by client", time: "3 hours ago", status: "approved" },
    { id: 4, type: "service", title: "Oil change completed", time: "4 hours ago", status: "completed" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'new': return 'text-purple-600 bg-purple-100';
      case 'unread': return 'text-red-600 bg-red-100';
      case 'approved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'upcoming': return Calendar;
      case 'new': return Bell;
      case 'unread': return MessageSquare;
      case 'approved': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const navigation = userRole === 'client' ? [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'vehicles', label: 'My Vehicles', icon: Car },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'quotes', label: 'Quotes', icon: FileText },
  ] : [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'quotes', label: 'Quotations', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return <ServiceScheduling userRole={userRole} />;
      case 'chat':
        return <ChatInterface userRole={userRole} />;
      case 'quotes':
        return <QuotationManager userRole={userRole} />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {profile?.full_name || 'User'}!
              </h2>
              <p className="text-blue-100">
                {userRole === 'client' 
                  ? 'Manage your vehicles and service appointments.' 
                  : 'Manage your workshop operations and client relationships.'
                }
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                          <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  {userRole === 'client' ? 'Your latest service updates' : 'Latest workshop activities'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const StatusIcon = getStatusIcon(activity.status);
                    return (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  {userRole === 'client' ? 'Frequently used actions' : 'Common workshop tasks'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userRole === 'client' ? (
                    <>
                      <Button className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <div className="text-center">
                          <Plus className="h-6 w-6 mx-auto mb-1" />
                          <span>Book Service</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-20">
                        <div className="text-center">
                          <Car className="h-6 w-6 mx-auto mb-1" />
                          <span>Add Vehicle</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-20">
                        <div className="text-center">
                          <MessageSquare className="h-6 w-6 mx-auto mb-1" />
                          <span>Contact Workshop</span>
                        </div>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="h-20 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                        <div className="text-center">
                          <Plus className="h-6 w-6 mx-auto mb-1" />
                          <span>New Quote</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-20">
                        <div className="text-center">
                          <Calendar className="h-6 w-6 mx-auto mb-1" />
                          <span>Schedule Service</span>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-20">
                        <div className="text-center">
                          <Users className="h-6 w-6 mx-auto mb-1" />
                          <span>Client Management</span>
                        </div>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Motix Garage</h1>
                  <p className="text-sm text-gray-500 capitalize">{userRole} Dashboard</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-4 ml-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
