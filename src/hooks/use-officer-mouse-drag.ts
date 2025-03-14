
import { useState, useRef } from 'react';
import { Officer } from '@/types';

interface MouseDragState {
  isDragging: boolean;
  ghostRef: React.MutableRefObject<HTMLDivElement | null>;
}

interface MouseDragHandlers {
  handleDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

export function useOfficerMouseDrag(officer: Officer): [MouseDragState, MouseDragHandlers] {
  const [isDragging, setIsDragging] = useState(false);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  // Handle mouse drag events
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("officerId", officer.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    
    // Add ghost dragging image for better visual feedback
    const dragImg = document.createElement('div');
    dragImg.className = 'invisible';
    document.body.appendChild(dragImg);
    
    // Create a dragging element for visual feedback
    const dragElement = document.createElement('div');
    dragElement.className = 'fixed z-50 pointer-events-none bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 opacity-90';
    dragElement.innerHTML = `<div>${officer.name}</div>`;
    dragElement.id = 'drag-ghost';
    document.body.appendChild(dragElement);
    ghostRef.current = dragElement;
    
    // Update ghost position during drag
    const updateGhostPosition = (e: MouseEvent) => {
      const ghost = document.getElementById('drag-ghost');
      if (ghost) {
        ghost.style.left = `${e.clientX + 10}px`;
        ghost.style.top = `${e.clientY + 10}px`;
      }
    };
    
    document.addEventListener('mousemove', updateGhostPosition);
    
    e.dataTransfer.setDragImage(dragImg, 0, 0);
    
    // Cleanup when drag ends
    const cleanup = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', updateGhostPosition);
      document.body.removeChild(dragImg);
      if (ghostRef.current) document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    };
    
    document.addEventListener('dragend', cleanup, { once: true });
  };

  return [
    { isDragging, ghostRef },
    { handleDragStart }
  ];
}
