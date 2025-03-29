const WasteRequest = require('../models/WasteRequest');

// Calculate efficiency score based on various metrics
const calculateEfficiencyScore = async (collectorId) => {
  try {
    // Get all completed requests for the collector
    const completedRequests = await WasteRequest.find({
      collectorId,
      status: 'completed'
    });

    if (completedRequests.length === 0) {
      return {
        totalCollections: 0,
        totalEarnings: 0,
        averageTimePerPickup: 0,
        onTimeCollections: 0,
        customerSatisfaction: 0,
        efficiencyScore: 0,
        routeOptimization: 0
      };
    }

    // Calculate total collections and earnings
    const totalCollections = completedRequests.length;
    const totalEarnings = completedRequests.reduce((sum, request) => sum + (request.price || 0), 0);

    // Calculate average time per pickup
    const totalTime = completedRequests.reduce((sum, request) => {
      if (request.completedAt && request.scheduledDate && request.scheduledTime) {
        const scheduledDateTime = new Date(request.scheduledDate);
        const [hours, minutes] = request.scheduledTime.split(':');
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        return sum + (request.completedAt - scheduledDateTime);
      }
      return sum;
    }, 0);

    const averageTimePerPickup = totalTime / totalCollections;

    // Calculate on-time collections (within 15 minutes of scheduled time)
    const onTimeCollections = completedRequests.filter(request => {
      if (!request.completedAt || !request.scheduledDate || !request.scheduledTime) return false;
      
      const scheduledDateTime = new Date(request.scheduledDate);
      const [hours, minutes] = request.scheduledTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const timeDiff = Math.abs(request.completedAt - scheduledDateTime);
      return timeDiff <= 15 * 60 * 1000; // 15 minutes in milliseconds
    }).length;

    // Calculate customer satisfaction (based on ratings if available)
    const customerSatisfaction = completedRequests.reduce((sum, request) => {
      return sum + (request.rating || 0);
    }, 0) / totalCollections;

    // Calculate route optimization score (based on average distance between pickups)
    const routeOptimization = calculateRouteOptimization(completedRequests);

    // Calculate overall efficiency score (weighted average of all metrics)
    const efficiencyScore = calculateOverallEfficiencyScore({
      totalCollections,
      onTimeCollections,
      customerSatisfaction,
      routeOptimization
    });

    return {
      totalCollections,
      totalEarnings,
      averageTimePerPickup,
      onTimeCollections,
      customerSatisfaction,
      efficiencyScore,
      routeOptimization
    };
  } catch (error) {
    console.error('Error calculating efficiency score:', error);
    throw error;
  }
};

// Calculate route optimization score
const calculateRouteOptimization = (requests) => {
  if (requests.length < 2) return 0;

  // Sort requests by completion time to get the actual route taken
  const sortedRequests = [...requests].sort((a, b) => a.completedAt - b.completedAt);
  
  let totalDistance = 0;
  let optimalDistance = 0;

  // Calculate actual distance traveled
  for (let i = 0; i < sortedRequests.length - 1; i++) {
    const current = sortedRequests[i];
    const next = sortedRequests[i + 1];
    
    if (current.businessId.coordinates && next.businessId.coordinates) {
      totalDistance += calculateDistance(
        current.businessId.coordinates,
        next.businessId.coordinates
      );
    }
  }

  // Calculate optimal distance (nearest neighbor algorithm)
  const unvisited = [...sortedRequests];
  const route = [unvisited.shift()];
  
  while (unvisited.length > 0) {
    const current = route[route.length - 1];
    let nearest = unvisited[0];
    let minDistance = Infinity;

    for (const request of unvisited) {
      if (current.businessId.coordinates && request.businessId.coordinates) {
        const distance = calculateDistance(
          current.businessId.coordinates,
          request.businessId.coordinates
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearest = request;
        }
      }
    }

    route.push(nearest);
    unvisited.splice(unvisited.indexOf(nearest), 1);
    optimalDistance += minDistance;
  }

  // Calculate optimization score (0-100)
  const optimizationScore = Math.max(0, Math.min(100, 
    ((optimalDistance / totalDistance) - 1) * 100
  ));

  return optimizationScore;
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLon = toRad(coord2[0] - coord1[0]);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(coord1[1])) * Math.cos(toRad(coord2[1])) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Convert degrees to radians
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Calculate overall efficiency score
const calculateOverallEfficiencyScore = (metrics) => {
  const weights = {
    onTimeRate: 0.3,
    customerSatisfaction: 0.3,
    routeOptimization: 0.4
  };

  const onTimeRate = metrics.onTimeCollections / metrics.totalCollections;
  
  return (
    onTimeRate * weights.onTimeRate +
    metrics.customerSatisfaction * weights.customerSatisfaction +
    (metrics.routeOptimization / 100) * weights.routeOptimization
  ) * 100;
};

module.exports = {
  calculateEfficiencyScore
}; 