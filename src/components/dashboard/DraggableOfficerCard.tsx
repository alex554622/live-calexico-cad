
import React from 'react';
import { Officer } from '@/types';
import { Card } from '../ui/card';
import { useDraggableOfficer } from '@/hooks/dashboard/use-draggable-officer';
import OfficerInfo from './officer-card/OfficerInfo';

interface DraggableOfficerCardProps {
  officer: Officer;
  onClick: () => void;
  draggable?: boolean;
}

const DraggableOfficerCard: React.FC<DraggableOfficerCardProps> = ({ 
  officer, 
  onClick,
  draggable = true
}) => {
  const {
    isDragging,
    cardRef,
    handleDragStart,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isTouchDevice
  } = useDraggableOfficer(officer.id, officer.name, draggable);

  return (
    <Card
      ref={cardRef}
      className={`p-2 cursor-pointer hover:bg-accent transition-colors
        ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={(e) => {
        // Only trigger click if not dragging
        if (!isDragging) {
          onClick();
        }
      }}
      draggable={draggable && !isTouchDevice}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <OfficerInfo officer={officer} />
    </Card>
  );
};

export default DraggableOfficerCard;
