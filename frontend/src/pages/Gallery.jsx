import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { galleryAPI } from '@/lib/api';
import GalleryCard from '@/components/gallery/GalleryCard';
import GalleryModal from '@/components/gallery/GalleryModal';
import ImageCropModal from '@/components/ui/image-crop-modal';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [formData, setFormData] = useState({
    src: '',
    height: 'medium',
    caption: '',
  });
  const [srcPreview, setSrcPreview] = useState(null);

  const handleOpenModal = (image = null) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        src: image.src || '',
        height: image.height || 'medium',
        caption: image.caption || '',
      });
      setSrcPreview(null);
    } else {
      setEditingImage(null);
      setFormData({
        src: '',
        height: 'medium',
        caption: '',
      });
      setSrcPreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingImage(null);
    setFormData({
      src: '',
      height: 'medium',
      caption: '',
    });
    setSrcPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  // Fetch function with debouncing
  const fetchImages = useCallback(
    async (page, reset = false) => {
      try {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await galleryAPI.getAll({
          page,
          limit: pagination.limit,
        });

        if (response && response.images && Array.isArray(response.images)) {
          if (reset) {
            setImages(response.images);
          } else {
            setImages((prev) => [...prev, ...response.images]);
          }

          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          if (reset) {
            setImages([]);
          }
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        if (reset) {
          setImages([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pagination.limit],
  );

  // Debounced version of fetchImages
  const [debouncedPage, setDebouncedPage] = useState(1);
  const debouncedPageValue = useDebounce(debouncedPage, 300);

  // Initial load
  useEffect(() => {
    fetchImages(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle debounced page changes
  useEffect(() => {
    if (debouncedPageValue > 1 && debouncedPageValue !== pagination.page) {
      fetchImages(debouncedPageValue, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPageValue, pagination.page]);

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (pagination.hasNext && !loadingMore && !loading) {
      setDebouncedPage(pagination.page + 1);
    }
  }, [pagination.hasNext, pagination.page, loadingMore, loading]);

  // Infinite scroll observer
  const observerTarget = useInfiniteScroll(
    loadMore,
    pagination.hasNext,
    loadingMore || loading,
    {
      threshold: 200,
    },
  );

  const handleFileChange = (file) => {
    if (file) {
      setImageFile(file);
      // Create preview for display
      const reader = new FileReader();
      reader.onloadend = () => {
        setSrcPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // File removed
      setImageFile(null);
      setSrcPreview(null);
      setFormData((prev) => ({
        ...prev,
        src: '',
      }));
    }
  };

  const handleOpenCropModal = () => {
    if (srcPreview) {
      setImageToCrop(srcPreview);
      setIsCropModalOpen(true);
    }
  };

  const handleCloseCropModal = () => {
    setIsCropModalOpen(false);
    setImageToCrop(null);
  };

  const handleCropComplete = (croppedFile) => {
    setImageFile(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSrcPreview(reader.result);
    };
    reader.readAsDataURL(croppedFile);
    handleCloseCropModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);

      let imageUrl = formData.src;

      // If a new file is selected, upload it first
      if (imageFile) {
        const uploadResult = await galleryAPI.upload(imageFile);
        imageUrl = uploadResult.url;
      }

      // If no URL available, show error
      if (!imageUrl) {
        throw new Error('Please select an image to upload');
      }

      const imageData = {
        src: imageUrl,
        height: formData.height,
        caption: formData.caption,
      };

      if (editingImage) {
        await galleryAPI.update(editingImage._id || editingImage.id, imageData);
      } else {
        await galleryAPI.create(imageData);
      }
      // Reset to first page and reload
      setPagination((prev) => ({ ...prev, page: 1 }));
      setDebouncedPage(1);
      fetchImages(1, true);
      handleCloseModal();
    } catch (error) {
      alert(error.message || 'Failed to save image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await galleryAPI.delete(id);
        // Remove deleted image from state
        setImages((prev) => prev.filter((img) => (img._id || img.id) !== id));
        // Update pagination total
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      } catch (error) {
        alert(error.message || 'Failed to delete image');
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
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your image gallery
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>+ Add Image</Button>
      </div>

      {images.length === 0 && !loading ? (
        <div className="py-12 text-center text-muted-foreground">
          No images found. Add your first image!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <GalleryCard
                key={image._id || image.id}
                image={image}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {pagination.hasNext && (
            <div ref={observerTarget} className="py-8 text-center">
              {loadingMore && (
                <div className="text-gray-500">Loading more images...</div>
              )}
            </div>
          )}

          {/* End of list indicator */}
          {!pagination.hasNext && images.length > 0 && (
            <div className="py-8 text-center text-gray-500">
              All images loaded ({pagination.total} total)
            </div>
          )}
        </>
      )}

      <GalleryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingImage={editingImage}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        srcPreview={srcPreview}
        uploading={uploading}
        onOpenCropModal={handleOpenCropModal}
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

export default Gallery;
