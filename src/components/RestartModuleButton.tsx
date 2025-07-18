import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface RestartModuleButtonProps {
  isComplete: boolean;
  onRestart: () => Promise<void>;
  disabled?: boolean;
}

export const RestartModuleButton = ({ 
  isComplete, 
  onRestart, 
  disabled = false 
}: RestartModuleButtonProps) => {
  const [isRestarting, setIsRestarting] = useState(false);
  const { toast } = useToast();

  // Only show restart button when viewing a completed module
  if (!isComplete) {
    return null;
  }

  const handleRestart = async () => {
    setIsRestarting(true);
    try {
      await onRestart();
      toast({
        title: "Module Restarted",
        description: "Starting fresh with a new session.",
      });
    } catch (error) {
      console.error('Error restarting module:', error);
      toast({
        title: "Error",
        description: "Failed to restart module. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={disabled || isRestarting}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restart Module
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restart Module</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to restart this module? This will create a new session 
            and start from the beginning. Your previous progress will remain saved but 
            you'll start fresh.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestart} disabled={isRestarting}>
            {isRestarting ? 'Restarting...' : 'Restart'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};