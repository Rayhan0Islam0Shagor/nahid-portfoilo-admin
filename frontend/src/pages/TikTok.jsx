import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { tiktokAPI } from '@/lib/api';
import TikTokCard from '@/components/tiktok/TikTokCard';
import TikTokModal from '@/components/tiktok/TikTokModal';

const TikTok = () => {
  const [videos, setVideos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    description: '',
    tiktokLink: '',
    thumbnail: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await tiktokAPI.getAll();
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        setVideos([]);
        alert('Invalid data format received from server');
      }
    } catch (error) {
      setVideos([]);
      alert(error.message || 'Failed to fetch TikTok videos');
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
        tiktokLink: video.tiktokLink || '',
        thumbnail: video.thumbnail || '',
      });
      setVideoPreview(null);
      setVideoFile(null);
      setThumbnailPreview(null);
      setThumbnailFile(null);
    } else {
      setEditingVideo(null);
      setFormData({
        videoUrl: '',
        title: '',
        description: '',
        tiktokLink: '',
        thumbnail: '',
      });
      setVideoPreview(null);
      setVideoFile(null);
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
      tiktokLink: '',
      thumbnail: '',
    });
    setVideoPreview(null);
    setVideoFile(null);
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

  const handleVideoChange = (file) => {
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // File removed
      setVideoFile(null);
      setVideoPreview(null);
      setFormData((prev) => ({
        ...prev,
        videoUrl: '',
      }));
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);

      let videoUrl = formData.videoUrl;

      // Upload video if a new file is selected
      let thumbnailUrl = formData.thumbnail;

      if (videoFile) {
        const uploadResult = await tiktokAPI.upload(videoFile);
        videoUrl = uploadResult.url;
        // Use auto-generated thumbnail only if no custom thumbnail is provided
        if (!thumbnailFile && !thumbnailUrl) {
          thumbnailUrl = uploadResult.thumbnail || '';
        }
      }

      // Upload thumbnail if a new file is selected
      if (thumbnailFile) {
        const uploadResult = await tiktokAPI.uploadThumbnail(thumbnailFile);
        thumbnailUrl = uploadResult.url;
      } else if (!editingVideo && !thumbnailUrl) {
        // For new videos without custom thumbnail, use auto-generated one if available
        // (already handled above if videoFile exists)
      }

      // Validate required fields
      if (!videoUrl) {
        throw new Error('Please select a video file');
      }
      if (!formData.title || formData.title.trim() === '') {
        throw new Error('Please enter a title');
      }

      const videoData = {
        videoUrl: videoUrl,
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : '',
        thumbnail: thumbnailUrl,
        tiktokLink: formData.tiktokLink ? formData.tiktokLink.trim() : '',
      };

      if (editingVideo) {
        await tiktokAPI.update(editingVideo._id || editingVideo.id, videoData);
      } else {
        await tiktokAPI.create(videoData);
      }
      await fetchVideos();
      handleCloseModal();
    } catch (error) {
      alert(error.message || 'Failed to save TikTok video');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this TikTok video?')) {
      try {
        await tiktokAPI.delete(id);
        await fetchVideos();
      } catch (error) {
        alert(error.message || 'Failed to delete TikTok video');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="py-8 text-center text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TikTok Videos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your TikTok videos
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>+ Add TikTok Video</Button>
      </div>

      {videos.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No TikTok videos found. Add your first video!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <TikTokCard
              key={video._id || video.id}
              video={video}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TikTokModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingVideo={editingVideo}
        formData={formData}
        handleInputChange={handleInputChange}
        handleVideoChange={handleVideoChange}
        handleThumbnailChange={handleThumbnailChange}
        handleSubmit={handleSubmit}
        videoPreview={videoPreview}
        thumbnailPreview={thumbnailPreview}
        uploading={uploading}
      />
    </div>
  );
};

export default TikTok;
