import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import YouTubeForm from './YouTubeForm';

const YouTubeModal = ({
  isOpen,
  onClose,
  editingVideo,
  formData,
  handleInputChange,
  handleThumbnailChange,
  handleSubmit,
  thumbnailPreview,
  uploading = false,
  onOpenCropModal,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingVideo ? 'Edit YouTube Video' : 'Add New YouTube Video'}
          </DialogTitle>
          <DialogDescription>
            {editingVideo
              ? 'Update the video information below.'
              : 'Fill in the details to add a new YouTube video.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <YouTubeForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleThumbnailChange={handleThumbnailChange}
            thumbnailPreview={thumbnailPreview}
            onOpenCropModal={onOpenCropModal}
          />
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Saving...' : editingVideo ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeModal;

