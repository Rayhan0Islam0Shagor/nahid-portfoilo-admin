import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TrackForm from './TrackForm';

const TrackModal = ({
  isOpen,
  onClose,
  editingTrack,
  formData,
  handleInputChange,
  handleThumbnailChange,
  handleAudioChange,
  handlePreviewAudioChange,
  handleSubmit,
  thumbnailPreview,
  audioPreview,
  previewAudioPreview,
  uploading = false,
  onOpenCropModal,
  audioFile,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTrack ? 'Edit Track' : 'Add New Track'}
          </DialogTitle>
          <DialogDescription>
            {editingTrack
              ? 'Update the track information below.'
              : 'Fill in the details to add a new track.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <TrackForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleThumbnailChange={handleThumbnailChange}
            handleAudioChange={handleAudioChange}
            handlePreviewAudioChange={handlePreviewAudioChange}
            thumbnailPreview={thumbnailPreview}
            audioPreview={audioPreview}
            previewAudioPreview={previewAudioPreview}
            onOpenCropModal={onOpenCropModal}
            audioFile={audioFile}
          />
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : editingTrack ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TrackModal;
