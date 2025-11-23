import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TikTokForm from './TikTokForm';

const TikTokModal = ({
  isOpen,
  onClose,
  editingVideo,
  formData,
  handleInputChange,
  handleVideoChange,
  handleThumbnailChange,
  handleSubmit,
  videoPreview,
  thumbnailPreview,
  uploading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingVideo ? 'Edit TikTok Video' : 'Add New TikTok Video'}
          </DialogTitle>
          <DialogDescription>
            {editingVideo
              ? 'Update the video information below.'
              : 'Fill in the details to add a new TikTok video.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <TikTokForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleVideoChange={handleVideoChange}
            handleThumbnailChange={handleThumbnailChange}
            videoPreview={videoPreview}
            thumbnailPreview={thumbnailPreview}
          />
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : editingVideo ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TikTokModal;

