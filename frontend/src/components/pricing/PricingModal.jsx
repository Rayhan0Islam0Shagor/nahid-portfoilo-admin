import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PricingForm from './PricingForm';

const PricingModal = ({
  isOpen,
  onClose,
  editingPlan,
  formData,
  handleInputChange,
  handleSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
          </DialogTitle>
          <DialogDescription>
            {editingPlan
              ? 'Update the pricing plan information below.'
              : 'Fill in the details to add a new pricing plan.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <PricingForm
            formData={formData}
            handleInputChange={handleInputChange}
          />
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingPlan ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
