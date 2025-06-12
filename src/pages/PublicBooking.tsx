
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react';
import PublicBookingForm from '@/components/booking/PublicBookingForm';
import PublicBookingConfirmation from '@/components/booking/PublicBookingConfirmation';

interface WorkshopData {
  workshop_id: string;
  workshop_name: string;
  workshop_email: string;
  workshop_phone: string;
  workshop_address: string;
  working_hours: any;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  services_offered: string[];
  tenant_id: string;
}

interface ReservationData {
  appointment_id: string;
  reservation_token: string;
}

const PublicBooking = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<WorkshopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ReservationData | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Invalid booking link');
      setLoading(false);
      return;
    }

    fetchWorkshopData();
  }, [slug]);

  const fetchWorkshopData = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_workshop_public_data', { workshop_slug: slug });

      if (error) throw error;

      if (!data || data.length === 0) {
        setError('Workshop not found or booking link is inactive');
        return;
      }

      setWorkshop(data[0]);
    } catch (err: any) {
      console.error('Error fetching workshop data:', err);
      setError('Failed to load workshop information');
    } finally {
      setLoading(false);
    }
  };

  const handleReservationCreated = (reservationData: ReservationData) => {
    setReservation(reservationData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workshop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--primary-color': workshop.primary_color } as any}>
      <div className="container mx-auto px-4 py-8">
        {/* Workshop Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            {workshop.logo_url && (
              <img 
                src={workshop.logo_url} 
                alt={workshop.workshop_name}
                className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
              />
            )}
            <CardTitle className="text-3xl font-bold" style={{ color: workshop.primary_color }}>
              {workshop.workshop_name}
            </CardTitle>
            <CardDescription className="text-lg">Book Your Service Appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {workshop.workshop_address && (
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">{workshop.workshop_address}</span>
                </div>
              )}
              {workshop.workshop_phone && (
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">{workshop.workshop_phone}</span>
                </div>
              )}
              {workshop.workshop_email && (
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">{workshop.workshop_email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Content */}
        {reservation ? (
          <PublicBookingConfirmation
            workshop={workshop}
            reservation={reservation}
          />
        ) : (
          <PublicBookingForm
            workshop={workshop}
            onReservationCreated={handleReservationCreated}
          />
        )}
      </div>
    </div>
  );
};

export default PublicBooking;
