
import { useState, useEffect } from 'react';

export const useDashboardNavigation = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    const handleSwitchToChat = (event: CustomEvent) => {
      console.log('Switching to chat with appointment:', event.detail);
      
      if (event.detail?.appointmentId) {
        setSelectedAppointmentId(event.detail.appointmentId);
      }
      
      setActiveTab('messages');
    };

    // Listen for the switchToChat event
    window.addEventListener('switchToChat', handleSwitchToChat as EventListener);

    return () => {
      window.removeEventListener('switchToChat', handleSwitchToChat as EventListener);
    };
  }, []);

  const handleCardClick = (cardType: string) => {
    console.log('Card clicked:', cardType);
    
    switch (cardType) {
      case 'appointments':
        setActiveTab('appointments');
        break;
      case 'services':
        setActiveTab('services');
        break;
      case 'vehicles':
        setActiveTab('vehicles');
        break;
      case 'clients':
        setActiveTab('clients');
        break;
      case 'messages':
        setActiveTab('messages');
        break;
      case 'quotations':
        setActiveTab('quotations');
        break;
      default:
        setActiveTab('appointments');
    }
  };

  return {
    activeTab,
    setActiveTab,
    selectedAppointmentId,
    handleCardClick,
  };
};
