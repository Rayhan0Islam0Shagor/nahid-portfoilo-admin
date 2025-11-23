import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { youtubeAPI } from '@/lib/api';
import YouTubeCard from '@/components/youtube/YouTubeCard';
import YouTubeModal from '@/components/youtube/YouTubeModal';
import ImageCropModal from '@/components/ui/image-crop-modal';

const YouTube = () => {
  const [videos, setVideos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    description: '',
    thumbnail: '',
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await youtubeAPI.getAll();
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        setVideos([]);
        alert('Invalid data format received from server');
      }
    } catch (error) {
      setVideos([]);
      alert(error.message || 'Failed to fetch YouTube videos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        videoUrl: video.videoUrl || '',
        title: video.title || '',
        description: video.description || '',
        thumbnail: video.thumbnail || '',
      });
      setThumbnailPreview(null);
      setThumbnailFile(null);
    } else {
      setEditingVideo(null);
      setFormData({
        videoUrl: '',
        title: '',
        description: '',
        thumbnail: '',
      });
      setThumbnailPreview(null);
      setThumbnailFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
    setFormData({
      videoUrl: '',
      title: '',
      description: '',
      thumbnail: '',
    });
    setThumbnailPreview(null);
    setThumbnailFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleThumbnailChange = (file) => {
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // File removed
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setFormData((prev) => ({
        ...prev,
        thumbnail: '',
      }));
    }
  };

  const handleOpenCropModal = () => {
    if (thumbnailPreview) {
      setImageToCrop(thumbnailPreview);
      setIsCropModalOpen(true);
    }
  };

  const handleCloseCropModal = () => {
    setIsCropModalOpen(false);
    setImageToCrop(null);
  };

  const handleCropComplete = (croppedFile) => {
    // Replace the original file with the cropped file
    setThumbnailFile(croppedFile);
    
    // Update preview with cropped image
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(croppedFile);
    
    setIsCropModalOpen(false);
    setImageToCrop(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);

      let thumbnailUrl = formData.thumbnail;

      // Upload thumbnail if a new file is selected
      if (thumbnailFile) {
        const uploadResult = await youtubeAPI.upload(thumbnailFile);
        thumbnailUrl = uploadResult.url;
      }

      // Validate required fields
      if (!formData.videoUrl || formData.videoUrl.trim() === '') {
        throw new Error('Please enter a YouTube video URL');
      }
      if (!formData.title || formData.title.trim() === '') {
        throw new Error('Please enter a title');
      }

      const videoData = {
        videoUrl: formData.videoUrl.trim(),
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : '',
        thumbnail: thumbnailUrl || '',
      };

      if (editingVideo) {
        await youtubeAPI.update(editingVideo._id || editingVideo.id, videoData);
      } else {
        await youtubeAPI.create(videoData);
      }
      await fetchVideos();
      handleCloseModal();
    } catch (error) {
      alert(error.message || 'Failed to save YouTube video');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this YouTube video?')) {
      try {
        await youtubeAPI.delete(id);
        await fetchVideos();
      } catch (error) {
        alert(error.message || 'Failed to delete YouTube video');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">YouTube Videos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your YouTube video links
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>+ Add YouTube Video</Button>
      </div>

      {videos.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No YouTube videos found. Add your first video!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <YouTubeCard
              key={video._id || video.id}
              video={video}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <YouTubeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingVideo={editingVideo}
        formData={formData}
        handleInputChange={handleInputChange}
        handleThumbnailChange={handleThumbnailChange}
        handleSubmit={handleSubmit}
        thumbnailPreview={thumbnailPreview}
        uploading={uploading}
        onOpenCropModal={handleOpenCropModal}
      />

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={handleCloseCropModal}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={null}
        minZoom={1}
        maxZoom={3}
      />
    </div>
  );
};

export default YouTube;
