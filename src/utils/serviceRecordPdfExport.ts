import jsPDF from "jspdf";
import { formatCurrency } from "@/utils/currency";
import { countries } from "@/utils/countries";

/**
 * Export a service record and its grouped services as a PDF,
 * with workshop/garage info and correct currency/unit.
 * @param service The full service record object (with vehicle/client info)
 * @param parsedServices Array of { serviceType, items } describing grouped service items
 * @param totalCost Calculated total cost (number)
 * @param nextOilChangeMileage String for next oil change mileage (if any)
 * @param plainNotes Plain technician notes, with no JSON prefix
 * @param workshop Optional workshop object, can include name, address, email, phone
 * @param preferences Workshop preferences (currency_code, distance_unit)
 */
export function exportServiceRecordToPDF(
  service: any,
  parsedServices: { serviceType: { value: string }, items: any[] }[],
  totalCost: number,
  nextOilChangeMileage: string,
  plainNotes: string,
  workshop?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  },
  preferences?: {
    currency_code?: string;
    distance_unit?: string;
  }
) {
  const doc = new jsPDF();
  let y = 18;

  // ----------------- HEADER WITH GARAGE INFO ------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text((workshop?.name || "Service Garage/Workshop"), 105, y, { align: "center" });

  doc.setFontSize(11);
  y += 8;
  doc.setFont("helvetica", "normal");

  if (workshop?.address) {
    doc.text(`Address: ${formatWorkshopAddress(workshop.address)}`, 105, y, { align: "center" }); y += 6;
  }
  if (workshop?.phone) {
    doc.text(`Phone: ${workshop.phone}`, 105, y, { align: "center" }); y += 6;
  }
  if (workshop?.email) {
    doc.text(`Email: ${workshop.email}`, 105, y, { align: "center" }); y += 6;
  }

  // Separate with line under header
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(18, y, 192, y);
  y += 8;

  // ----------------- RECORD TITLE ------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Service Record", 105, y, { align: "center" });
  y += 12;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  //--------- Garage/Vehicle/Client section ---------
  doc.text("Vehicle:", 15, y); 
  doc.text(
    service.vehicle
      ? `${service.vehicle.year} ${service.vehicle.make} ${service.vehicle.model}`
      : "—",
    45, y
  );
  y += 8;
  doc.text("License Plate:", 15, y);
  doc.text(service.vehicle?.license_plate || "—", 45, y);
  y += 8;
  doc.text("Client:", 15, y);
  doc.text(service.client?.full_name || "—", 45, y);
  if (service.client?.phone) {
    y += 8;
    doc.text("Phone:", 15, y);
    doc.text(service.client.phone, 45, y);
  }
  y += 8;
  doc.text("Status:", 15, y);
  doc.text(service.status, 45, y);

  // ----------------- Services Performed ---------------
  y += 12;
  doc.setFont("helvetica", "bold");
  doc.text("Services Performed", 15, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  parsedServices.forEach((svc, idx) => {
    doc.setFont("helvetica", "bold");
    doc.text(`• ${svc.serviceType.value || "Service"}`, 20, y);
    doc.setFont("helvetica", "normal");
    if (!svc.items.length) {
      doc.text("No items listed.", 30, y + 6);
      y += 12;
      return;
    }
    // Table header
    y += 5;
    doc.setFontSize(9);
    doc.text("Name", 30, y);
    doc.text("Qty", 90, y);
    doc.text("Price", 110, y);
    doc.text("Subtotal", 140, y);
    doc.setLineWidth(0.1);
    doc.line(30, y + 2, 180, y + 2);

    y += 7;
    svc.items.forEach(item => {
      if (y > 260) {
        doc.addPage(); y = 20;
      }
      doc.setFontSize(9);
      doc.text(item.name || "-", 30, y);
      doc.text(String(item.quantity || "-"), 90, y);
      doc.text(formatCurrency(
          Number(item.price),
          preferences?.currency_code || "USD"
        ), 110, y);
      doc.text(
        formatCurrency(
          Number(item.price) * Number(item.quantity),
          preferences?.currency_code || "USD"
        ), 140, y);
      y += 6;
    });
    y += 4;
  });

  // ----------------- Cost summary -----------------
  y += 5;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Cost Summary", 15, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Calculated Total:", 18, y);
  doc.text(formatCurrency(totalCost, preferences?.currency_code || "USD"), 50, y);

  // ----------------- Detail summary -----------------
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Other Details", 15, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // --- Distance unit
  const isMiles = preferences?.distance_unit === "miles";
  const distanceUnit = isMiles ? "miles" : "km";
  const currentMileageLabel = isMiles ? "Current Miles:" : "Current Kilometers:";
  const nextOilChangeLabel = isMiles ? "Next Oil Change Miles:" : "Next Oil Change Kilometers:";

  doc.text(currentMileageLabel, 18, y);
  doc.text(service.mileage != null ? `${service.mileage.toLocaleString()} ${distanceUnit}` : "—", 68, y);

  if (nextOilChangeMileage) {
    y += 6;
    doc.text(nextOilChangeLabel, 18, y);
    doc.text(`${nextOilChangeMileage.toLocaleString()} ${distanceUnit}`, 68, y);
  }

  if (typeof service.labor_hours === "number") {
    y += 6;
    doc.text("Labor Hours:", 18, y);
    doc.text(String(service.labor_hours), 50, y);
  }

  // Description
  if (service.description) {
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Description", 15, y);
    y += 7;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(service.description, 170);
    doc.text(lines, 18, y);
    y += lines.length * 5;
  }

  // Technician notes
  if (plainNotes) {
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Technician Notes", 15, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const notesLines = doc.splitTextToSize(plainNotes, 170);
    doc.text(notesLines, 18, y);
    y += notesLines.length * 5;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text("Generated by Workshop Management System", 15, 287);
  doc.text(new Date().toLocaleString(), 150, 287);

  // Save
  const fileName = `ServiceRecord-${service.id || "Record"}.pdf`;
  doc.save(fileName);
}

// Helper: Format workshop address (obj or string) to readable string
function formatWorkshopAddress(address: any): string {
  if (!address) return "";
  // If address is an object with standard keys
  if (
    typeof address === "object" &&
    address !== null &&
    "street" in address
  ) {
    // Find country name from code
    let countryCode = Array.isArray(address.country) ? address.country[0] : address.country;
    let countryName = "";
    if (typeof countryCode === "string") {
      countryName = countries.find((c) => c.code === countryCode)?.name || countryCode;
    }
    return [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      countryName,
    ]
      .filter(Boolean)
      .join(", ");
  } else if (typeof address === "string" && address.startsWith("{") && address.endsWith("}")) {
    // Try to parse stringified object (just in case!)
    try {
      const obj = JSON.parse(address);
      return formatWorkshopAddress(obj);
    } catch {
      // fallback to plain string
    }
  }
  // Legacy: plain string address, could include commas
  return String(address);
}
