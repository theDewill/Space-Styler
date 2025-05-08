import React, { useRef, useEffect, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { FurnitureItem, Position, Point2D } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isValidPolygon, calculatePolygonArea, calculateLineLength } from "@/utils/shapeUtils";
import { Ruler, Upload } from "lucide-react";
import { importSceneFromJSON } from "@/utils/exportUtils";

const RoomCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    currentProject,
    view,
    updateFurniture,
    setIsDragging,
    addFurniture,
    updateRoomProperties,
    setView,
    importScene,
  } = useProject();
  const [draggedItem, setDraggedItem] = useState<FurnitureItem | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState<number>(40); // pixels per meter
  const [drawPoints, setDrawPoints] = useState<Point2D[]>([]);
  const [roomArea, setRoomArea] = useState<number>(0);
  const [isDrawingLine, setIsDrawingLine] = useState<boolean>(false);
  const [currentDrawPoint, setCurrentDrawPoint] = useState<Point2D | null>(null);
  const [rotationCenter, setRotationCenter] = useState<Position | null>(null);
  const [initialRotation, setInitialRotation] = useState<number>(0);
  const [initialMouseAngle, setInitialMouseAngle] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [initialSize, setInitialSize] = useState<{ width: number; length: number } | null>(null);
  const [initialMouseDistance, setInitialMouseDistance] = useState<number>(0);

  // Handle file upload for scene import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept JSON files
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast("Invalid file type", {
        description: "Please select a JSON file.",
      });
      return;
    }

    // Import the scene
    importSceneFromJSON(file, importScene);

    // Reset the input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !currentProject) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const room = currentProject.room;
    const furniture = currentProject.furniture;

    // Set canvas dimensions based on room size and scale
    const roomWidth = room.dimensions.width;
    const roomLength = room.dimensions.length;

    canvas.width = roomWidth * scale;
    canvas.height = roomLength * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw room floor
    ctx.fillStyle = "#f8f9fa";

    if (room.customShape && room.customShape.length >= 3) {
      // Draw custom floor shape
      ctx.beginPath();
      ctx.moveTo(room.customShape[0].x * scale, room.customShape[0].y * scale);
      for (let i = 1; i < room.customShape.length; i++) {
        ctx.lineTo(room.customShape[i].x * scale, room.customShape[i].y * scale);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#e9ecef";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Calculate and display room area
      const area = calculatePolygonArea(room.customShape);
      setRoomArea(area);
    } else {
      // Draw default rectangular floor
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate and set rectangular room area
      setRoomArea(roomWidth * roomLength);
    }

    // Draw grid if enabled
    if (view.showGrid) {
      ctx.strokeStyle = "#e9ecef";
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let x = 0; x <= roomWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, canvas.height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y <= roomLength; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(canvas.width, y * scale);
        ctx.stroke();
      }
    }

    // Draw furniture
    furniture.forEach((item) => {
      const isSelected = item.id === view.selectedFurnitureId;

      // Convert 3D position to 2D canvas coordinates
      const x = item.position.x * scale;
      const y = item.position.z * scale;
      const width = item.dimensions.width * scale;
      const length = item.dimensions.length * scale;

      // Draw furniture item - use the actual material color now
      ctx.fillStyle = item.material.color + (isSelected ? "80" : "40");
      ctx.strokeStyle = isSelected ? "#000" : item.material.color;
      ctx.lineWidth = isSelected ? 2 : 1;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(item.rotation.y);
      ctx.fillRect(-width / 2, -length / 2, width, length);
      ctx.strokeRect(-width / 2, -length / 2, width, length);

      // Always display furniture name
      ctx.fillStyle = "#000";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(item.name, 0, 0);

      ctx.restore();

      // Draw dimensions if selected and showDimensions is true
      if (isSelected && view.showDimensions) {
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          `${item.name} (${item.dimensions.width}x${item.dimensions.length}m)`,
          x,
          y - 10,
        );

        // Draw rotation indicator for selected items
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(item.rotation.y) * 30, y + Math.sin(item.rotation.y) * 30);
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw rotation handle circle
        ctx.beginPath();
        ctx.arc(
          x + Math.cos(item.rotation.y) * 30,
          y + Math.sin(item.rotation.y) * 30,
          5,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "#2563eb";
        ctx.fill();

        // Draw resize handles at corners
        const corners = [
          { x: -width / 2, y: -length / 2 },
          { x: width / 2, y: -length / 2 },
          { x: width / 2, y: length / 2 },
          { x: -width / 2, y: length / 2 },
        ];

        corners.forEach((corner) => {
          // Apply rotation to corner positions
          const rotX = corner.x * Math.cos(item.rotation.y) - corner.y * Math.sin(item.rotation.y);
          const rotY = corner.x * Math.sin(item.rotation.y) + corner.y * Math.cos(item.rotation.y);

          ctx.beginPath();
          ctx.arc(x + rotX, y + rotY, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#10b981";
          ctx.fill();
        });
      }
    });

    // Draw points for room drawing mode
    if (view.isDrawingRoom && drawPoints.length > 0) {
      ctx.fillStyle = "#4338ca";

      // Draw lines between points
      ctx.beginPath();
      ctx.moveTo(drawPoints[0].x * scale, drawPoints[0].y * scale);

      for (let i = 1; i < drawPoints.length; i++) {
        ctx.lineTo(drawPoints[i].x * scale, drawPoints[i].y * scale);

        // Display line length
        const prevPoint = drawPoints[i - 1];
        const currentPoint = drawPoints[i];
        const midX = ((prevPoint.x + currentPoint.x) / 2) * scale;
        const midY = ((prevPoint.y + currentPoint.y) / 2) * scale;
        const length = calculateLineLength(prevPoint, currentPoint).toFixed(2);

        ctx.fillStyle = "#000";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.save();

        // Calculate angle for rotated text
        const angle = Math.atan2(currentPoint.y - prevPoint.y, currentPoint.x - prevPoint.x);
        ctx.translate(midX, midY);
        ctx.rotate(angle);
        ctx.fillText(`${length}m`, 0, -5);
        ctx.restore();

        ctx.fillStyle = "#4338ca";
      }

      // Connect back to the first point if we have enough points
      if (drawPoints.length >= 3) {
        ctx.setLineDash([5, 5]);
        ctx.lineTo(drawPoints[0].x * scale, drawPoints[0].y * scale);

        // Display length of closing line
        const firstPoint = drawPoints[0];
        const lastPoint = drawPoints[drawPoints.length - 1];
        const midX = ((firstPoint.x + lastPoint.x) / 2) * scale;
        const midY = ((firstPoint.y + lastPoint.y) / 2) * scale;
        const closingLength = calculateLineLength(firstPoint, lastPoint).toFixed(2);

        ctx.fillStyle = "#000";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.save();

        // Calculate angle for rotated text
        const angle = Math.atan2(firstPoint.y - lastPoint.y, firstPoint.x - lastPoint.x);
        ctx.translate(midX, midY);
        ctx.rotate(angle);
        ctx.fillText(`${closingLength}m`, 0, -5);
        ctx.restore();

        ctx.fillStyle = "#4338ca";
        ctx.setLineDash([]);

        // Display area of the shape being drawn
        const area = calculatePolygonArea(drawPoints).toFixed(2);
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        const centerX =
          (drawPoints.reduce((sum, point) => sum + point.x, 0) / drawPoints.length) * scale;
        const centerY =
          (drawPoints.reduce((sum, point) => sum + point.y, 0) / drawPoints.length) * scale;
        ctx.fillText(`Area: ${area}m²`, centerX, centerY);
      }

      ctx.strokeStyle = "#4338ca";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw points
      drawPoints.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x * scale, point.y * scale, 6, 0, Math.PI * 2);
        ctx.fill();

        // Mark first point differently
        if (index === 0) {
          ctx.beginPath();
          ctx.arc(point.x * scale, point.y * scale, 8, 0, Math.PI * 2);
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Draw current line being drawn
      if (isDrawingLine && currentDrawPoint) {
        const lastPoint = drawPoints[drawPoints.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x * scale, lastPoint.y * scale);
        ctx.lineTo(currentDrawPoint.x * scale, currentDrawPoint.y * scale);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "#4338ca";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);

        // Display length of current line being drawn
        const length = calculateLineLength(lastPoint, currentDrawPoint).toFixed(2);
        const midX = ((lastPoint.x + currentDrawPoint.x) / 2) * scale;
        const midY = ((lastPoint.y + currentDrawPoint.y) / 2) * scale;

        ctx.fillStyle = "#000";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.save();

        // Calculate angle for rotated text
        const angle = Math.atan2(
          currentDrawPoint.y - lastPoint.y,
          currentDrawPoint.x - lastPoint.x,
        );
        ctx.translate(midX, midY);
        ctx.rotate(angle);
        ctx.fillText(`${length}m`, 0, -5);
        ctx.restore();
      }
    }
  }, [
    currentProject,
    view,
    scale,
    draggedItem,
    drawPoints,
    isDrawingLine,
    currentDrawPoint,
    rotationCenter,
    isRotating,
    isResizing,
  ]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentProject) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // In drawing mode
    if (view.isDrawingRoom) {
      // Check if clicking near the first point to close the shape
      if (drawPoints.length > 2) {
        const firstPoint = drawPoints[0];
        const distance = Math.sqrt(Math.pow(firstPoint.x - x, 2) + Math.pow(firstPoint.y - y, 2));

        if (distance < 0.5) {
          // Within half a meter
          finishRoomDrawing();
          return;
        }
      }

      // Start drawing a line from the last point or create first point
      if (drawPoints.length === 0) {
        setDrawPoints([{ x, y }]);
      } else {
        // Start drawing a line from the last point
        setIsDrawingLine(true);
        setCurrentDrawPoint({ x, y });
      }
      return;
    }

    // Check if any furniture item is clicked
    for (let i = currentProject.furniture.length - 1; i >= 0; i--) {
      const item = currentProject.furniture[i];
      const itemX = item.position.x;
      const itemY = item.position.z;
      const itemRotation = item.rotation.y;
      const itemWidth = item.dimensions.width;
      const itemLength = item.dimensions.length;

      // Check if a rotation handle is clicked
      if (item.id === view.selectedFurnitureId) {
        // Calculate rotation handle position
        const rotHandleX = itemX + (Math.cos(itemRotation) * 30) / scale;
        const rotHandleY = itemY + (Math.sin(itemRotation) * 30) / scale;

        const distToRotHandle = Math.sqrt(
          Math.pow(rotHandleX - x, 2) + Math.pow(rotHandleY - y, 2),
        );

        if (distToRotHandle < 0.3) {
          // Within 0.3 meters (30cm)
          setIsRotating(true);
          setRotationCenter({ x: itemX, y: 0, z: itemY });
          setInitialRotation(itemRotation);
          setInitialMouseAngle(Math.atan2(y - itemY, x - itemX));
          setDraggedItem(item);
          setView({ selectedFurnitureId: item.id });
          return;
        }

        // Check if a resize handle is clicked
        const corners = [
          { x: -itemWidth / 2, y: -itemLength / 2 },
          { x: itemWidth / 2, y: -itemLength / 2 },
          { x: itemWidth / 2, y: itemLength / 2 },
          { x: -itemWidth / 2, y: itemLength / 2 },
        ];

        for (const corner of corners) {
          // Apply rotation to corner positions
          const rotX = corner.x * Math.cos(itemRotation) - corner.y * Math.sin(itemRotation);
          const rotY = corner.x * Math.sin(itemRotation) + corner.y * Math.cos(itemRotation);

          const cornerX = itemX + rotX;
          const cornerY = itemY + rotY;

          const distToCorner = Math.sqrt(Math.pow(cornerX - x, 2) + Math.pow(cornerY - y, 2));

          if (distToCorner < 0.3) {
            // Within 0.3 meters (30cm)
            setIsResizing(true);
            setInitialSize({ width: itemWidth, length: itemLength });
            const mouseDistToCenter = Math.sqrt(Math.pow(x - itemX, 2) + Math.pow(y - itemY, 2));
            setInitialMouseDistance(mouseDistToCenter);
            setDraggedItem(item);
            setView({ selectedFurnitureId: item.id });
            return;
          }
        }
      }

      // Transform mouse coords to object space to account for rotation
      const dx = x - itemX;
      const dy = y - itemY;

      // Rotate back to check if inside rectangle
      const rotDx = dx * Math.cos(-itemRotation) - dy * Math.sin(-itemRotation);
      const rotDy = dx * Math.sin(-itemRotation) + dy * Math.cos(-itemRotation);

      // Check if inside rotated rectangle
      if (Math.abs(rotDx) <= itemWidth / 2 && Math.abs(rotDy) <= itemLength / 2) {
        // Select item and enter drag mode
        setDraggedItem(item);
        setDragOffset({
          x: itemX - x,
          y: 0,
          z: itemY - y,
        });
        setIsDragging(true);

        // Also select the item in view state
        setView({ selectedFurnitureId: item.id });
        return;
      }
    }

    // If clicked outside any furniture, deselect
    setView({ selectedFurnitureId: null });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // If we're dragging furniture
    if (draggedItem && !isRotating && !isResizing) {
      updateFurniture(draggedItem.id, {
        position: {
          ...draggedItem.position,
          x: x + dragOffset.x,
          z: y + dragOffset.z,
        },
      });
      return;
    }

    // If we're rotating furniture
    if (draggedItem && isRotating && rotationCenter) {
      const mouseAngle = Math.atan2(y - rotationCenter.z, x - rotationCenter.x);
      const newRotation = initialRotation + (mouseAngle - initialMouseAngle);

      updateFurniture(draggedItem.id, {
        rotation: {
          ...draggedItem.rotation,
          y: newRotation,
        },
      });
      return;
    }

    // If we're resizing furniture
    if (draggedItem && isResizing && initialSize) {
      const centerX = draggedItem.position.x;
      const centerY = draggedItem.position.z;

      // Calculate distance from mouse to center
      const mouseDistToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

      // Calculate scale factor based on initial distance
      const scaleFactor = mouseDistToCenter / initialMouseDistance;

      // Apply scale to initial dimensions
      const newWidth = Math.max(0.1, initialSize.width * scaleFactor);
      const newLength = Math.max(0.1, initialSize.length * scaleFactor);

      updateFurniture(draggedItem.id, {
        dimensions: {
          ...draggedItem.dimensions,
          width: newWidth,
          length: newLength,
        },
      });
      return;
    }

    // If we're drawing a line in room drawing mode
    if (view.isDrawingRoom && isDrawingLine) {
      setCurrentDrawPoint({ x, y });
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If we were drawing a line, complete it
    if (view.isDrawingRoom && isDrawingLine && currentDrawPoint) {
      setDrawPoints([...drawPoints, currentDrawPoint]);
      setIsDrawingLine(false);
      setCurrentDrawPoint(null);
    }

    // Reset furniture manipulation
    setDraggedItem(null);
    setIsDragging(false);
    setIsRotating(false);
    setRotationCenter(null);
    setIsResizing(false);
    setInitialSize(null);
  };

  const handleCanvasMouseLeave = () => {
    // Cancel drawing line if mouse leaves canvas
    if (isDrawingLine) {
      setIsDrawingLine(false);
      setCurrentDrawPoint(null);
    }

    // Reset furniture manipulation
    setDraggedItem(null);
    setIsDragging(false);
    setIsRotating(false);
    setRotationCenter(null);
    setIsResizing(false);
    setInitialSize(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!canvasRef.current || !currentProject) return;

    // Get furniture data
    try {
      const furnitureData = JSON.parse(e.dataTransfer.getData("furniture"));
      if (!furnitureData) return;

      // Calculate drop position
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      // Add furniture at drop position
      const newFurniture = {
        ...furnitureData,
        id: `${furnitureData.id}-${Date.now()}`,
        position: {
          x: x,
          y: 0, // always on floor
          z: y,
        },
      };

      addFurniture(newFurniture);
      toast("Furniture added to your room");
    } catch (err) {
      console.error("Error dropping furniture", err);
      toast("Error adding furniture", {
        description: "Something went wrong when adding furniture.",
      });
    }
  };

  const startRoomDrawing = () => {
    setDrawPoints([]);
    setIsDrawingLine(false);
    setCurrentDrawPoint(null);
    setView({ ...view, isDrawingRoom: true });
  };

  const cancelRoomDrawing = () => {
    setDrawPoints([]);
    setIsDrawingLine(false);
    setCurrentDrawPoint(null);
    setView({ ...view, isDrawingRoom: false });
  };

  const finishRoomDrawing = () => {
    if (drawPoints.length < 3) {
      toast("Not enough points", {
        description: "You need at least 3 points to create a room shape.",
      });
      return;
    }

    if (isValidPolygon(drawPoints)) {
      // Update room with custom shape
      const area = calculatePolygonArea(drawPoints);
      updateRoomProperties({
        customShape: drawPoints,
      });

      toast("Room shape updated", {
        description: `Your custom room shape has been created. Area: ${area.toFixed(2)}m²`,
      });

      // Exit drawing mode
      setView({ ...view, isDrawingRoom: false });
      setDrawPoints([]);
      setIsDrawingLine(false);
      setCurrentDrawPoint(null);
    } else {
      toast("Invalid shape", {
        description: "The shape you drew is not valid. Please try again.",
      });
    }
  };

  const resetRoomShape = () => {
    updateRoomProperties({
      customShape: undefined,
    });

    toast("Room shape reset", {
      description: "Room shape has been reset to default rectangle.",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Drawing controls */}
      <div className="mb-2">
        {view.isDrawingRoom ? (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={finishRoomDrawing}
              disabled={drawPoints.length < 3}
            >
              Finish Shape
            </Button>
            <Button variant="outline" size="sm" onClick={cancelRoomDrawing}>
              Cancel
            </Button>
            <p className="text-sm text-muted-foreground ml-2">
              {drawPoints.length === 0
                ? "Click to place first point, then drag to create walls"
                : isDrawingLine
                  ? "Release to place next point"
                  : "Click and drag from last point to continue or click first point to finish"}
            </p>
            {drawPoints.length >= 3 && (
              <p className="text-sm ml-2">Area: {calculatePolygonArea(drawPoints).toFixed(2)}m²</p>
            )}
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={startRoomDrawing}>
              <Ruler className="h-4 w-4 mr-1" /> Draw Custom Room Shape
            </Button>

            {/* <Button
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
            >
              <Upload className="h-4 w-4 mr-1" /> Import Scene
            </Button> */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            {currentProject?.room.customShape && (
              <>
                <Button variant="outline" size="sm" onClick={resetRoomShape}>
                  Reset to Rectangle
                </Button>
                <p className="text-sm ml-2">Room Area: {roomArea.toFixed(2)}m²</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="canvas-2d w-full h-full flex-1 flex items-center justify-center overflow-hidden"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <canvas
          ref={canvasRef}
          className={view.isDrawingRoom ? "cursor-crosshair" : "cursor-move"}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseLeave}
        />
      </div>
    </div>
  );
};

export default RoomCanvas;
