
import { useState } from "react";
import { useAppointmentData } from "./useAppointmentData";
import AppointmentEditModal from "./AppointmentEditModal";
import ServiceReportModal from "./ServiceReportModal";
import AppointmentCard from "./AppointmentCard";
import AppointmentListHeader from "./AppointmentListHeader";
import EmptyAppointmentState from "./EmptyAppointmentState";
import AppointmentLoadingState from "./AppointmentLoadingState";
import { useAppointmentActions } from "./useAppointmentActions";
import { useAppointmentFiltering } from "./useAppointmentFiltering";
// Import the enhanced list
import EnhancedAppointmentList from "./EnhancedAppointmentList";

interface AppointmentListProps {
  filter?: 'upcoming' | 'history' | 'all';
}

const AppointmentList = ({ filter = 'upcoming' }: AppointmentListProps) => {
  // Use the enhanced component instead of the old one
  return <EnhancedAppointmentList filter={filter} />;
};

export default AppointmentList;
