import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const PricingCard = ({ plan, onEdit, onDelete }) => {
  // Format price with BDT symbol
  const formatPrice = (price) => {
    return `৳ ${parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-300 group hover:shadow-md hover:border-gray-300">
      <CardContent className="p-4">
        {/* Title */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {plan.title || plan.name || 'Untitled Plan'}
          </h3>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-primary">
            {formatPrice(plan.price)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
            onClick={() => onEdit(plan)}
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-medium transition-colors text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
            onClick={() => onDelete(plan._id || plan.id)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingCard;
