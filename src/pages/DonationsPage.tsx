import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import CreateDonation from '@/components/CreateDonation';
import MyDonations from '@/components/MyDonations';
import DonationDetails from '@/components/DonationDetails';
import AdminDonations from '@/components/AdminDonations';

interface Donation {
  id: number;
  amount: string;
  donation_method: {
    id: number;
    name: string;
  };
  status: string;
  donor_message: string;
  payment_proof?: string;
  created_at: string;
  updated_at: string;
  comments_count?: number;
  donor?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

const DonationsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [activeTab, setActiveTab] = useState('create');

  const handleViewDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setActiveTab('details');
  };

  const handleBackToList = () => {
    setSelectedDonation(null);
    setActiveTab(user?.is_staff ? 'admin' : 'my-donations');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Sistema de Doações</h1>
          <p className="text-gray-600">
            Faça login para acessar o sistema de doações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Doações</h1>
        <p className="text-gray-600">
          {user.is_staff 
            ? 'Gerir e acompanhar todas as doações da plataforma'
            : 'Contribua para nossos programas de solidariedade'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-auto">
          {!user.is_staff && (
            <>
              <TabsTrigger value="create">Fazer Doação</TabsTrigger>
              <TabsTrigger value="my-donations">Minhas Doações</TabsTrigger>
            </>
          )}
          {user.is_staff && (
            <TabsTrigger value="admin">Gestão Administrativa</TabsTrigger>
          )}
          {selectedDonation && (
            <TabsTrigger value="details">Detalhes da Doação</TabsTrigger>
          )}
        </TabsList>

        {!user.is_staff && (
          <>
            <TabsContent value="create" className="mt-6">
              <CreateDonation />
            </TabsContent>

            <TabsContent value="my-donations" className="mt-6">
              <MyDonations onViewDetails={handleViewDetails} />
            </TabsContent>
          </>
        )}

        {user.is_staff && (
          <TabsContent value="admin" className="mt-6">
            <AdminDonations onViewDetails={handleViewDetails} />
          </TabsContent>
        )}

        {selectedDonation && (
          <TabsContent value="details" className="mt-6">
            <DonationDetails
              donationId={selectedDonation.id}
              onBack={handleBackToList}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DonationsPage;
