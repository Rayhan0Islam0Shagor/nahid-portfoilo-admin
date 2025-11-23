import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/useDataContext';
import { pricingAPI } from '@/lib/api';
import PricingCard from '@/components/pricing/PricingCard';
import PricingModal from '@/components/pricing/PricingModal';

const Pricing = () => {
  const { pricingPlans, refreshData, fetchDataIfNeeded } = useData();

  useEffect(() => {
    fetchDataIfNeeded();
  }, [fetchDataIfNeeded]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
  });

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        title: plan.title || '',
        price: plan.price || '',
      });
    } else {
      setEditingPlan(null);
      setFormData({
        title: '',
        price: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormData({
      title: '',
      price: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const planData = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
      };

      if (editingPlan) {
        await pricingAPI.update(editingPlan._id || editingPlan.id, planData);
      } else {
        await pricingAPI.create(planData);
      }
      await refreshData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving pricing plan:', error);
      alert(error.message || 'Failed to save pricing plan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pricing plan?')) {
      try {
        await pricingAPI.delete(id);
        await refreshData();
      } catch (error) {
        console.error('Error deleting pricing plan:', error);
        alert(error.message || 'Failed to delete pricing plan');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Plans</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your pricing plans
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>+ Add Plan</Button>
      </div>

      {pricingPlans.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No pricing plans found. Add your first plan!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan._id || plan.id}
              plan={plan}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <PricingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingPlan={editingPlan}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default Pricing;
