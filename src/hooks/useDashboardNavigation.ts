
import { useState, useEffect } from 'react';

export const useDashboardNavigation = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for tab and appointment
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const appointmentParam = urlParams.get('appointment');

    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (appointmentParam) {
      setSelectedAppointmentId(appointmentParam);
    }

    // Listen for chat navigation events
    const handleSwitchToChat = (event: CustomEvent) => {
      const { appointmentId, appointment } = event.detail;
      setSelectedAppointmentId(appointmentId);
      setActiveTab('messages');
      
      // Store appointment context
      if (appointment) {
        sessionStorage.setItem('selectedAppointment', JSON.stringify(appointment));
      }
    };

    window.addEventListener('switchToChat', handleSwitchToChat as EventListener);
    
    return () => {
      window.removeEventListener('switchToChat', handleSwitchToChat as EventListener);
    };
  }, []);

  const handleCardClick = (tab: string) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    setActiveTab,
    selectedAppointmentId,
    handleCardClick,
  };
};
