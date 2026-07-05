export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return Number(d.toFixed(1));
}
  
const deg2rad = (deg) => {
    return deg * (Math.PI/180)
}

export const calculateETA = (distanceKm) => {
    // Assume average speed 30km/h -> 0.5 km/min -> 2 mins per km
    // Add 10 mins for prep time
    return Math.round(distanceKm * 2 + 10);
}
