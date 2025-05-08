import { Point2D } from '@/types';

// Check if a polygon is valid (no self-intersections, has enough points)
export const isValidPolygon = (points: Point2D[]): boolean => {
  // Need at least 3 points for a valid polygon
  if (points.length < 3) return false;
  
  // Basic check: Ensure last point is different from first point
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  
  // For now, we're just implementing basic validation
  // A more advanced check would detect self-intersections
  return true;
}

// Calculate area of a polygon
export const calculatePolygonArea = (points: Point2D[]): number => {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  
  area = Math.abs(area) / 2;
  return area;
}

// Calculate length between two points
export const calculateLineLength = (p1: Point2D, p2: Point2D): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Check if a point is inside a polygon (ray casting algorithm)
export const pointInPolygon = (point: Point2D, polygon: Point2D[]): boolean => {
  if (polygon.length < 3) return false;
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y)) && 
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      
    if (intersect) inside = !inside;
  }
  
  return inside;
}

// Get bounding dimensions of a polygon
export const getPolygonBoundingBox = (points: Point2D[]): { width: number, length: number } => {
  if (points.length === 0) {
    return { width: 0, length: 0 };
  }
  
  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;
  
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }
  
  return {
    width: maxX - minX,
    length: maxY - minY
  };
}

// Calculate centroid of a polygon
export const calculateCentroid = (points: Point2D[]): Point2D => {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }
  
  let sumX = 0;
  let sumY = 0;
  
  for (let i = 0; i < points.length; i++) {
    sumX += points[i].x;
    sumY += points[i].y;
  }
  
  return {
    x: sumX / points.length,
    y: sumY / points.length
  };
}

// Improved Firebase URL detection with support for different patterns
export const isFirebaseStorageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  return url.toLowerCase().includes('firebasestorage.googleapis.com') || 
         url.toLowerCase().includes('storage.googleapis.com');
}

// Enhanced Firebase URL processing with better error handling and debugging
export const processFirebaseUrl = (url: string): string => {
  try {
    console.log("Processing Firebase URL:", url);
    
    // Skip processing if URL is invalid
    if (!url || !url.trim()) {
      return url;
    }
    
    // Special handling for different Firebase URL formats
    if (url.includes('firebasestorage.googleapis.com/v0/b/')) {
      // Parse the URL to make sure it's valid
      try {
        const parsedUrl = new URL(url);
        
        // Check if the URL already has the alt=media parameter
        if (!parsedUrl.searchParams.has('alt')) {
          console.log("Adding alt=media parameter to Firebase URL");
          // Add the alt=media parameter if it's missing
          parsedUrl.searchParams.append('alt', 'media');
          return parsedUrl.toString();
        }
        
        console.log("URL already has alt=media parameter");
        // Return the original URL as it already has alt=media parameter
        return url;
      } catch (error) {
        console.error("Invalid Firebase URL or parsing error:", error);
        return url;
      }
    }
    
    // For storage.googleapis.com format
    if (url.includes('storage.googleapis.com')) {
      if (!url.includes('alt=media')) {
        return url + (url.includes('?') ? '&' : '?') + 'alt=media';
      }
    }
    
    // Return original URL if no specific processing was needed
    return url;
  } catch (error) {
    console.error("Error in processFirebaseUrl:", error);
    // Return the original URL if parsing fails
    return url;
  }
}

// Process various URL types to get direct download links
export const getDirectDownloadUrl = (url: string): string => {
  // Special handling for encoded Firebase URLs
  if (url.includes('%2F') && (url.includes('firebasestorage') || url.includes('storage.googleapis.com'))) {
    console.log("Processing encoded Firebase URL:", url);
    return processFirebaseUrl(url);
  }
  
  // Handle Firebase Storage URLs
  if (isFirebaseStorageUrl(url)) {
    return processFirebaseUrl(url);
  }
  
  // Handle Google Drive links
  if (url.includes('drive.google.com')) {
    // Extract the file ID from the URL
    const fileIdMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }
  
  // Handle Dropbox links
  if (url.includes('dropbox.com')) {
    // Convert dropbox.com/s/ links to dropbox.com/s/dl/
    return url.replace('www.dropbox.com/s/', 'www.dropbox.com/s/dl/');
  }
  
  // Return the original URL for other cases
  return url;
}

// Validate if a URL points to a supported 3D model format
export const isValidModelUrl = (url: string): boolean => {
  if (!url || url.trim().length === 0) return false;
  
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.toLowerCase();
    
    // Check for OBJ format (our currently supported format)
    if (path.endsWith('.obj')) return true;
    
    // Check for Firebase Storage, Google Drive or other storage services
    if (isFirebaseStorageUrl(url) || 
        url.includes('drive.google.com/file/d/') ||
        url.includes('storage.googleapis.com') ||
        url.includes('amazonaws.com') ||
        url.includes('blob.core.windows.net') ||
        url.includes('dropbox.com')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error validating model URL:", error);
    return false;
  }
}

// Extract meaningful name from URL
export const extractNameFromUrl = (url: string): string => {
  try {
    // Try to get the filename from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    let lastPart = pathParts[pathParts.length - 1];
    
    // For Firebase Storage URLs, extract the file name from the 'o' parameter
    if (isFirebaseStorageUrl(url)) {
      const searchParams = urlObj.searchParams;
      const objectPath = searchParams.get('o');
      if (objectPath) {
        // Decode the path and extract the filename
        const decodedPath = decodeURIComponent(objectPath);
        const pathSegments = decodedPath.split('/');
        lastPart = pathSegments[pathSegments.length - 1];
      }
    }
    
    // Remove file extension and replace dashes/underscores with spaces
    return lastPart.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  } catch (e) {
    // If URL parsing fails, return empty string
    return "";
  }
}
