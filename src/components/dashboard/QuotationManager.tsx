
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useQuotations } from "@/hooks/useQuotations";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import QuotationForm from "@/components/quotations/QuotationForm";
import QuotationList from "@/components/quotations/QuotationList";
import QuotationModal from "@/components/quotations/QuotationModal";
import type { Quotation } from "@/hooks/useQuotations";

interface QuotationManagerProps {
  userRole: 'client' | 'workshop';
}

const QuotationManager = ({ userRole }: QuotationManagerProps) => {
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  
  const { profile } = useAuth();
  const { 
    quotations, 
    loading, 
    updateQuotationStatus 
  } = useQuotations();

  const handleQuotationCreated = () => {
    setShowNewQuoteForm(false);
  };

  const handleApproveQuote = async (id: string) => {
    await updateQuotationStatus(id, 'approved', new Date().toISOString());
  };

  const handleRejectQuote = async (id: string) => {
    await updateQuotationStatus(id, 'rejected');
  };

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowQuotationModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Quotations...</h2>
          <p className="text-muted-foreground">Please wait while we load your quotations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {userRole === 'client' ? 'My Quotes' : 'Quotation Management'}
          </h2>
          <p className="text-gray-600">
            {userRole === 'client' 
              ? 'Review and manage service quotes from workshops' 
              : 'Create and manage service quotations for clients'}
          </p>
        </div>
        {userRole === 'workshop' && (
          <Button 
            onClick={() => setShowNewQuoteForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {quotations.filter(q => q.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {quotations.filter(q => q.status === 'approved').length}
            </div>
            <p className="text-sm text-gray-600">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {quotations.filter(q => q.status === 'rejected').length}
            </div>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              ${quotations
                .filter(q => q.status === 'approved')
                .reduce((sum, q) => sum + (q.total_cost || 0), 0)
                .toFixed(0)}
            </div>
            <p className="text-sm text-gray-600">Approved Value</p>
          </CardContent>
        </Card>
      </div>

      {/* New Quote Form */}
      {showNewQuoteForm && userRole === 'workshop' && (
        <QuotationForm
          onSuccess={handleQuotationCreated}
        />
      )}

      {/* Quotations List */}
      <QuotationList
        quotations={quotations}
        userRole={userRole}
        onApprove={handleApproveQuote}
        onReject={handleRejectQuote}
        onView={handleViewQuotation}
      />

      {/* Quotation Detail Modal */}
      <QuotationModal
        quotation={selectedQuotation}
        isOpen={showQuotationModal}
        onClose={() => {
          setShowQuotationModal(false);
          setSelectedQuotation(null);
        }}
      />
    </div>
  );
};

export default QuotationManager;
