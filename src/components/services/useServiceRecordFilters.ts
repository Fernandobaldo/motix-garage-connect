
import { useState } from "react";
import type { ServiceFilterState } from "@/types/database";

// Handles the unified filter state for service records & history
export function useServiceRecordFilters() {
  const [filters, setFilters] = useState<ServiceFilterState>({});
  return { filters, setFilters };
}
