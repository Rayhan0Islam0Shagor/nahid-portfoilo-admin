import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PricingForm = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter pricing plan title"
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Enter price"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Price will be displayed with ৳ (BDT) symbol
        </p>
      </div>
    </div>
  );
};

export default PricingForm;
