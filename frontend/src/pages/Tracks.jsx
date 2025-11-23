import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { tracksAPI } from '@/lib/api';
import TrackCard from '@/components/tracks/TrackCard';
import TrackModal from '@/components/tracks/TrackModal';
import ImageCropModal from '@/components/ui/image-crop-modal';

const Tracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    thumbnail: '',
    title: '',
    audio: '',
    previewAudio: '',
    releaseDate: '',
    price: '',
    category: '',
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [previewAudioFile, setPreviewAudioFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [previewAudioPreview, setPreviewAudioPreview] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const handleOpenModal = (track = null) => {
    if (track) {
      setEditingTrack(track);
      setFormData({
        thumbnail: track.thumbnail || '',
        title: track.title || '',
        audio: track.audio || '',
        previewAudio: track.previewAudio || '',
        releaseDate: track.releaseDate
          ? new Date(track.releaseDate).toISOString().split('T')[0]
          : '',
        price: track.price || '',
        category: track.category || '',
      });
      setThumbnailPreview(null);
      setAudioPreview(null);
      setPreviewAudioPreview(null);
      setThumbnailFile(null);
      setAudioFile(null);
      setPreviewAudioFile(null);
    } else {
      setEditingTrack(null);
      setFormData({
        thumbnail: '',
        title: '',
        audio: '',
        previewAudio: '',
        releaseDate: '',
        price: '',
        category: '',
      });
      setThumbnailPreview(null);
      setAudioPreview(null);
      setPreviewAudioPreview(null);
      setThumbnailFile(null);
      setAudioFile(null);
      setPreviewAudioFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrack(null);
    setFormData({
      thumbnail: '',
      title: '',
      audio: '',
      previewAudio: '',
      releaseDate: '',
      price: '',
      category: '',
    });
    setThumbnailPreview(null);
    setAudioPreview(null);
    setPreviewAudioPreview(null);
    setThumbnailFile(null);
    setAudioFile(null);
    setPreviewAudioFile(null);
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
    setThumbnailFile(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(croppedFile);
    handleCloseCropModal();
  };

  const handleAudioChange = (file) => {
    if (file) {
      setAudioFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAudioPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // File removed
      setAudioFile(null);
      setAudioPreview(null);
      setFormData((prev) => ({
        ...prev,
        audio: '',
      }));
    }
  };

  const handlePreviewAudioChange = (file) => {
    if (file) {
      setPreviewAudioFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAudioPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // File removed
      setPreviewAudioFile(null);
      setPreviewAudioPreview(null);
      setFormData((prev) => ({
        ...prev,
        previewAudio: '',
      }));
    }
  };

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const data = await tracksAPI.getAll();
      if (Array.isArray(data)) {
        setTracks(data);
      } else {
        setTracks([]);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from tracks
  const categories = [
    ...new Set(tracks.map((track) => track.category).filter(Boolean)),
  ].sort();

  // Filter tracks by category
  const filteredTracks = selectedCategory
    ? tracks.filter((track) => track.category === selectedCategory)
    : tracks;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);

      let thumbnailUrl = formData.thumbnail;
      let audioUrl = formData.audio;
      let previewAudioUrl = formData.previewAudio;

      // Upload thumbnail if a new file is selected
      if (thumbnailFile) {
        const uploadResult = await tracksAPI.uploadThumbnail(thumbnailFile);
        thumbnailUrl = uploadResult.url;
      }

      // Upload audio if a new file is selected
      if (audioFile) {
        const uploadResult = await tracksAPI.uploadAudio(audioFile);
        audioUrl = uploadResult.url;
      }

      // Upload preview audio if a new file is selected
      if (previewAudioFile) {
        const uploadResult = await tracksAPI.uploadPreviewAudio(previewAudioFile);
        previewAudioUrl = uploadResult.url;
      }

      // Validate required fields
      if (!thumbnailUrl) {
        throw new Error('Please select a thumbnail image');
      }
      if (!audioUrl) {
        throw new Error('Please select an audio file');
      }
      if (!previewAudioUrl) {
        throw new Error('Please select a preview audio file');
      }
      if (!formData.title || formData.title.trim() === '') {
        throw new Error('Please enter a title');
      }
      if (!formData.releaseDate) {
        throw new Error('Please select a release date');
      }
      if (!formData.category || formData.category.trim() === '') {
        throw new Error('Please select a category');
      }
      if (!formData.price || parseFloat(formData.price) < 0) {
        throw new Error('Please enter a valid price');
      }

      const trackData = {
        thumbnail: thumbnailUrl,
        title: formData.title.trim(),
        audio: audioUrl,
        previewAudio: previewAudioUrl,
        releaseDate: formData.releaseDate,
        price: parseFloat(formData.price),
        category: formData.category.trim(),
      };

      if (editingTrack) {
        await tracksAPI.update(editingTrack._id || editingTrack.id, trackData);
      } else {
        await tracksAPI.create(trackData);
      }
      await fetchTracks();
      handleCloseModal();
    } catch (error) {
      alert(error.message || 'Failed to save track');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      try {
        await tracksAPI.delete(id);
        await fetchTracks();
      } catch (error) {
        alert(error.message || 'Failed to delete track');
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
          <h1 className="text-3xl font-bold text-gray-900">Tracks</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your music tracks</p>
        </div>
        <Button onClick={() => handleOpenModal()}>+ Add Track</Button>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 items-center mb-4">
          <label
            htmlFor="category-filter"
            className="text-sm font-medium text-gray-700"
          >
            Filter by Category:
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredTracks.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          {selectedCategory
            ? `No tracks found in category "${selectedCategory}". Add your first track!`
            : 'No tracks found. Add your first track!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTracks.map((track) => (
            <TrackCard
              key={track._id || track.id}
              track={track}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TrackModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingTrack={editingTrack}
        formData={formData}
        handleInputChange={handleInputChange}
        handleThumbnailChange={handleThumbnailChange}
        handleAudioChange={handleAudioChange}
        handlePreviewAudioChange={handlePreviewAudioChange}
        handleSubmit={handleSubmit}
        thumbnailPreview={thumbnailPreview}
        audioPreview={audioPreview}
        previewAudioPreview={previewAudioPreview}
        uploading={uploading}
        onOpenCropModal={handleOpenCropModal}
        audioFile={audioFile}
      />

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={handleCloseCropModal}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={null}
        minZoom={0.5}
        maxZoom={5}
      />
    </div>
  );
};

export default Tracks;
