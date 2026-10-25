import { useState } from 'react';
import { addMinutes, format } from 'date-fns';

export interface BMTCRoute {
  busNumber?: string;
  fare: number;
  duration: string;
  journeyType: 'bus-only' | 'metro-only' | 'bus-metro' | 'train-only' | 'direct' | 'walk';
  steps: Array<{
    type: 'bus' | 'metro' | 'walk' | 'train' | 'auto' | 'bike' | 'car' | 'sedan';
    name?: string;
    duration?: string;
  }>;
  arrivalTime: string;
  vehicleType?: string;
  distance?: string;
}

export const useBMTCRoutes = () => {
  const [routes, setRoutes] = useState<BMTCRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async (source: string, destination: string, filterType: string = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      // Helper function to calculate arrival time
      const calculateArrivalTime = (durationStr: string): string => {
        const now = new Date();
        
        // Parse duration string (e.g., "1 hr 45 mins", "45 mins", "2 hr 15 mins")
        let totalMinutes = 0;
        
        const hourMatch = durationStr.match(/(\d+)\s*hr/);
        const minMatch = durationStr.match(/(\d+)\s*min/);
        
        if (hourMatch) {
          totalMinutes += parseInt(hourMatch[1]) * 60;
        }
        if (minMatch) {
          totalMinutes += parseInt(minMatch[1]);
        }
        
        const arrivalDate = addMinutes(now, totalMinutes);
        return format(arrivalDate, 'hh:mma');
      };
      
      // Generate random routes based on filter type
      const generateRandomRoutes = (): BMTCRoute[] => {
        const routes: BMTCRoute[] = [];
        
        // Bus and Metro routes (1-20 results)
        if (filterType === 'bus' || filterType === 'metro' || filterType === 'all') {
          const count = Math.floor(Math.random() * 20) + 1;
          const busNumbers = ['335-E', '410-AB', '201-D', '500-C', '600-A', '273-K', '450-G', '365-H', '222-B', '777-X'];
          const metroLines = ['Purple Line', 'Green Line', 'Red Line', 'Blue Line', 'Yellow Line'];
          
          for (let i = 0; i < count; i++) {
            const isBusOnly = filterType === 'bus' || (filterType === 'all' && Math.random() < 0.4);
            const isMetroOnly = filterType === 'metro' || (filterType === 'all' && Math.random() < 0.3);
            const isBusMetro = !isBusOnly && !isMetroOnly;
            
            if (isBusOnly) {
              const busNum = busNumbers[Math.floor(Math.random() * busNumbers.length)] + '-' + Math.floor(Math.random() * 100);
              const duration = `${Math.floor(Math.random() * 2) + 1} hr ${Math.floor(Math.random() * 60)} mins`;
              routes.push({
                busNumber: busNum,
                fare: Math.floor(Math.random() * 50) + 30,
                duration,
                arrivalTime: calculateArrivalTime(duration),
                journeyType: 'bus-only',
                steps: [
                  { type: 'walk', duration: `${Math.floor(Math.random() * 10) + 1} min` },
                  { type: 'bus', name: busNum, duration: `${Math.floor(Math.random() * 60) + 20} min` },
                  { type: 'walk', duration: `${Math.floor(Math.random() * 5) + 1} min` },
                ],
              });
            } else if (isMetroOnly) {
              const metroLine = metroLines[Math.floor(Math.random() * metroLines.length)];
              const duration = `${Math.floor(Math.random() * 60) + 30} mins`;
              routes.push({
                busNumber: metroLine,
                fare: Math.floor(Math.random() * 30) + 20,
                duration,
                arrivalTime: calculateArrivalTime(duration),
                journeyType: 'metro-only',
                steps: [
                  { type: 'walk', duration: `${Math.floor(Math.random() * 10) + 1} min` },
                  { type: 'metro', name: metroLine, duration: `${Math.floor(Math.random() * 50) + 20} min` },
                  { type: 'walk', duration: `${Math.floor(Math.random() * 10) + 1} min` },
                ],
              });
            } else {
              const busNum = busNumbers[Math.floor(Math.random() * busNumbers.length)] + '-' + Math.floor(Math.random() * 100);
              const metroLine = metroLines[Math.floor(Math.random() * metroLines.length)];
              const duration = `${Math.floor(Math.random() * 2) + 1} hr ${Math.floor(Math.random() * 60)} mins`;
              routes.push({
                busNumber: busNum,
                fare: Math.floor(Math.random() * 70) + 50,
                duration,
                arrivalTime: calculateArrivalTime(duration),
                journeyType: 'bus-metro',
                steps: [
                  { type: 'walk', duration: `${Math.floor(Math.random() * 5) + 1} min` },
                  { type: 'bus', name: busNum, duration: `${Math.floor(Math.random() * 40) + 20} min` },
                  { type: 'walk', duration: `${Math.floor(Math.random() * 5) + 1} min` },
                  { type: 'metro', name: metroLine, duration: `${Math.floor(Math.random() * 40) + 20} min` },
                  { type: 'walk', duration: `${Math.floor(Math.random() * 5) + 1} min` },
                ],
              });
            }
          }
        }
        
        // Train routes (1-7 results)
        if (filterType === 'airport-rail') {
          const count = Math.floor(Math.random() * 7) + 1;
          const trainNames = ['Hampi Express', 'Shatabdi Express', 'Rajdhani Express', 'Duronto Express', 'Garib Rath', 'Jan Shatabdi', 'Intercity Express'];
          
          for (let i = 0; i < count; i++) {
            const trainNum = Math.floor(Math.random() * 90000) + 10000;
            const trainName = trainNames[Math.floor(Math.random() * trainNames.length)];
            const duration = `${Math.floor(Math.random() * 3) + 1} hr ${Math.floor(Math.random() * 60)} mins`;
            routes.push({
              busNumber: `${trainNum} ${trainName}`,
              fare: Math.floor(Math.random() * 100) + 60,
              duration,
              arrivalTime: calculateArrivalTime(duration),
              journeyType: 'train-only',
              steps: [
                { type: 'walk', duration: `${Math.floor(Math.random() * 15) + 5} min` },
                { type: 'train', name: `${trainNum} ${trainName}`, duration: `${Math.floor(Math.random() * 120) + 60} min` },
                { type: 'walk', duration: `${Math.floor(Math.random() * 10) + 1} min` },
              ],
            });
          }
        }
        
        // Direct rides (1-25 results)
        if (filterType === 'direct') {
          const count = Math.floor(Math.random() * 25) + 1;
          const vehicleTypes = ['Car', 'Sedan', 'Bike', 'Auto'];
          
          for (let i = 0; i < count; i++) {
            const vehicle = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
            const baseFares = { 'Bike': [80, 150], 'Auto': [150, 220], 'Car': [200, 300], 'Sedan': [250, 400] };
            const durations = { 'Bike': [20, 35], 'Auto': [25, 45], 'Car': [25, 40], 'Sedan': [25, 40] };
            
            const fareRange = baseFares[vehicle as keyof typeof baseFares];
            const durationRange = durations[vehicle as keyof typeof durations];
            
            const fare = Math.floor(Math.random() * (fareRange[1] - fareRange[0])) + fareRange[0];
            const durationMins = Math.floor(Math.random() * (durationRange[1] - durationRange[0])) + durationRange[0];
            const duration = `${durationMins} mins`;
            const distance = `${(Math.random() * 15 + 5).toFixed(1)} km`;
            
            routes.push({
              vehicleType: vehicle,
              fare,
              duration,
              arrivalTime: calculateArrivalTime(duration),
              distance,
              journeyType: 'direct',
              steps: [
                { type: vehicle.toLowerCase() as 'bike' | 'auto' | 'car' | 'sedan', duration },
              ],
            });
          }
        }
        
        // Walk option
        if (filterType === 'walk') {
          const duration = `${Math.floor(Math.random() * 2) + 1} hr ${Math.floor(Math.random() * 60)} mins`;
          routes.push({
            fare: 0,
            duration,
            arrivalTime: calculateArrivalTime(duration),
            distance: `${(Math.random() * 10 + 2).toFixed(1)} km`,
            journeyType: 'walk',
            steps: [
              { type: 'walk', duration },
            ],
          });
        }
        
        return routes;
      };

      const allRoutes = generateRandomRoutes();

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoutes(allRoutes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  return { routes, loading, error, fetchRoutes };
};