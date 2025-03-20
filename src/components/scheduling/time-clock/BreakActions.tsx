
import React from 'react';
import { Coffee, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useEmployeeShifts } from '@/hooks/scheduling/use-employee-shifts';
import { EmployeeBreak, EmployeeShift } from '@/types/scheduling';

interface BreakActionsProps {
  currentShift: EmployeeShift | null;
  currentBreak: EmployeeBreak | null;
  selectedBreakType: 'paid10' | 'unpaid30' | 'unpaid60';
  setSelectedBreakType: React.Dispatch<React.SetStateAction<'paid10' | 'unpaid30' | 'unpaid60'>>;
  isProcessingBreak: boolean;
  setIsProcessingBreak: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BreakActions: React.FC<BreakActionsProps> = ({
  currentShift,
  currentBreak,
  selectedBreakType,
  setSelectedBreakType,
  isProcessingBreak,
  setIsProcessingBreak
}) => {
  const { toast } = useToast();
  const { startBreak, endBreak } = useEmployeeShifts();

  const handleBreakStart = async () => {
    if (!currentShift) return;
    
    setIsProcessingBreak(true);
    try {
      await startBreak(currentShift.id, selectedBreakType);
      toast({
        title: 'Break Started',
        description: `Your ${selectedBreakType === 'paid10' ? '10-minute' : selectedBreakType === 'unpaid30' ? '30-minute' : '1-hour'} break has started`,
      });
    } catch (error) {
      console.error('Error starting break:', error);
      toast({
        title: 'Error',
        description: 'Failed to start break. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingBreak(false);
    }
  };
  
  const handleBreakEnd = async () => {
    if (!currentBreak) return;
    
    setIsProcessingBreak(true);
    try {
      await endBreak(currentBreak.id);
      toast({
        title: 'Break Ended',
        description: 'Your break has ended successfully',
      });
    } catch (error) {
      console.error('Error ending break:', error);
      toast({
        title: 'Error',
        description: 'Failed to end break. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingBreak(false);
    }
  };

  if (currentBreak) {
    return (
      <Button 
        className="w-full"
        variant="outline"
        onClick={handleBreakEnd}
        disabled={isProcessingBreak}
      >
        {currentBreak.type === 'paid10' ? (
          <Coffee className="mr-2 h-4 w-4" />
        ) : (
          <Utensils className="mr-2 h-4 w-4" />
        )}
        {isProcessingBreak ? 'Processing...' : 'End Break'}
      </Button>
    );
  }

  if (currentShift) {
    return (
      <div className="col-span-2 grid grid-cols-3 gap-2">
        <Select
          value={selectedBreakType}
          onValueChange={(value) => 
            setSelectedBreakType(value as 'paid10' | 'unpaid30' | 'unpaid60')
          }
          disabled={isProcessingBreak}
        >
          <SelectTrigger className="col-span-1">
            <SelectValue placeholder="Break Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paid10">10-min (Paid)</SelectItem>
            <SelectItem value="unpaid30">30-min Lunch</SelectItem>
            <SelectItem value="unpaid60">1-hour Lunch</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          className="col-span-1"
          onClick={handleBreakStart}
          disabled={isProcessingBreak}
        >
          {selectedBreakType === 'paid10' ? (
            <Coffee className="mr-2 h-4 w-4" />
          ) : (
            <Utensils className="mr-2 h-4 w-4" />
          )}
          {isProcessingBreak ? 'Wait...' : 'Break'}
        </Button>
        {/* Clock Out button will come from parent component */}
      </div>
    );
  }

  return null;
};
