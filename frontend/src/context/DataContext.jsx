import { useState, useEffect } from 'react';
import { tracksAPI, galleryAPI, pricingAPI, dashboardAPI } from '@/lib/api';
import { DataContext } from './useDataContext';

export const DataProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalTracksSold: 0,
    totalProfit: 0,
    totalImages: 0,
    totalPricingPlans: 0,
  });
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Lazy fetch data only when needed (not on mount)
  const fetchDataIfNeeded = async () => {
    if (initialized) return;

    setLoading(true);
    try {
      const [tracksData, imagesResponse, plansData] = await Promise.all([
        tracksAPI.getAll().catch(() => []),
        galleryAPI
          .getAll({ page: 1, limit: 20 })
          .catch(() => ({ images: [], pagination: {} })),
        pricingAPI.getAll().catch(() => []),
      ]);

      setTracks(tracksData);
      // Handle paginated response from gallery API
      setImages(imagesResponse?.images || imagesResponse || []);
      setPricingPlans(plansData);
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats when tracks change (only if data is initialized)
  useEffect(() => {
    if (!initialized) return;

    const fetchStats = async () => {
      try {
        const statsData = await dashboardAPI.getStats();
        setStats(statsData);
      } catch {
        // Calculate stats locally if API fails
        setStats({
          totalTracks: tracks.length,
          totalTracksSold: tracks.reduce(
            (sum, track) => sum + (track.soldCount || 0),
            0,
          ),
          totalProfit: tracks.reduce(
            (sum, track) => sum + (track.soldCount || 0) * (track.price || 0),
            0,
          ),
          totalImages: images.length,
          totalPricingPlans: pricingPlans.length,
        });
      }
    };

    fetchStats();
  }, [tracks, images, pricingPlans, initialized]);

  // Wrapper functions that update both state and API
  const updateTracks = async (newTracks) => {
    setTracks(newTracks);
  };

  const updatePricingPlans = async (newPlans) => {
    setPricingPlans(newPlans);
  };

  const updateImages = async (newImages) => {
    setImages(newImages);
  };

  const value = {
    tracks,
    setTracks: updateTracks,
    pricingPlans,
    setPricingPlans: updatePricingPlans,
    images,
    setImages: updateImages,
    stats,
    loading,
    fetchDataIfNeeded,
    refreshData: async () => {
      setLoading(true);
      try {
        const [tracksData, imagesResponse, plansData] = await Promise.all([
          tracksAPI.getAll(),
          galleryAPI.getAll({ page: 1, limit: 20 }),
          pricingAPI.getAll(),
        ]);
        setTracks(tracksData);
        // Handle paginated response from gallery API
        setImages(imagesResponse?.images || imagesResponse || []);
        setPricingPlans(plansData);
        setInitialized(true);
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        setLoading(false);
      }
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
