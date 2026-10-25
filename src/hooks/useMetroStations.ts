import { useState, useEffect } from 'react';

export interface MetroStation {
  name: string;
  latitude: number;
  longitude: number;
}

export const useMetroStations = () => {
  const [stations, setStations] = useState<MetroStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://raw.githubusercontent.com/Ankith882/App-Assets-2/main/Metro%20Stations');
      if (!response.ok) {
        throw new Error('Failed to fetch metro stations');
      }
      const data: MetroStation[] = await response.json();
      setStations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  return { stations, loading, error, refetch: fetchStations };
};