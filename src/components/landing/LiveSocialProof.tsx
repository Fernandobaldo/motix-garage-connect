
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Activity {
  id: string;
  name: string;
  action: string;
  location: string;
  timestamp: string;
}

const LiveSocialProof = () => {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Mock recent activities
  const activities: Activity[] = [
    { id: "1", name: "Marco R.", action: "started free trial", location: "Milan", timestamp: "2 min ago" },
    { id: "2", name: "Klaus M.", action: "upgraded to Pro", location: "Berlin", timestamp: "5 min ago" },
    { id: "3", name: "Jean D.", action: "joined Motix", location: "Lyon", timestamp: "8 min ago" },
    { id: "4", name: "Ana G.", action: "booked demo", location: "Madrid", timestamp: "12 min ago" },
    { id: "5", name: "Piet V.", action: "started free trial", location: "Amsterdam", timestamp: "15 min ago" },
    { id: "6", name: "Sofia L.", action: "upgraded to Enterprise", location: "Brussels", timestamp: "18 min ago" },
  ];

  useEffect(() => {
    // Show first activity after 3 seconds
    const initialTimer = setTimeout(() => {
      setCurrentActivity(activities[0]);
      setIsVisible(true);
    }, 3000);

    // Cycle through activities every 8 seconds
    const interval = setInterval(() => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setCurrentActivity(randomActivity);
      setIsVisible(true);
      
      // Hide after 5 seconds
      setTimeout(() => setIsVisible(false), 5000);
    }, 8000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  if (!currentActivity) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
              {currentActivity.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentActivity.name}
              </p>
              <span className="text-green-500 text-xs">●</span>
            </div>
            <p className="text-sm text-gray-600">
              {currentActivity.action} from {currentActivity.location}
            </p>
            <p className="text-xs text-gray-500">{currentActivity.timestamp}</p>
          </div>
        </div>
        
        {/* Small pulse animation */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default LiveSocialProof;
