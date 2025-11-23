import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import GalleryForm from './GalleryForm';

const GalleryModal = ({
  isOpen,
  onClose,
  editingImage,
  formData,
  handleInputChange,
  handleSelectChange,
  handleFileChange,
  handleSubmit,
  srcPreview,
  uploading = false,
  onOpenCropModal,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingImage ? 'Edit Image' : 'Add New Image'}
          </DialogTitle>
          <DialogDescription>
            {editingImage
              ? 'Update the image information below.'
              : 'Fill in the details to add a new image.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <GalleryForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleFileChange={handleFileChange}
            srcPreview={srcPreview}
            onOpenCropModal={onOpenCropModal}
          />
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : editingImage ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryModal;
