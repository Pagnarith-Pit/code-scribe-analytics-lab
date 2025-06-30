
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hintLevel: 1 | 2 | 3;
  hintContent: string;
  onHintViewed: (viewingDuration: number) => void;
}

export const HintModal = ({ isOpen, onClose, hintLevel, hintContent, onHintViewed }: HintModalProps) => {
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setStartTime(Date.now());
    }
  }, [isOpen]);

  const handleClose = () => {
    if (startTime) {
      const viewingDuration = Date.now() - startTime;
      onHintViewed(viewingDuration);
    }
    onClose();
  };

  const getHintTitle = () => {
    switch (hintLevel) {
      case 1: return 'Hint Level 1 - Gentle Nudge';
      case 2: return 'Hint Level 2 - Direct Guidance';
      case 3: return 'Hint Level 3 - Complete Solution';
      default: return 'Hint';
    }
  };

  const getHintIcon = () => {
    switch (hintLevel) {
      case 1: return '💡';
      case 2: return '🎯';
      case 3: return '✨';
      default: return '💡';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{getHintIcon()}</span>
            {getHintTitle()}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {hintContent}
            </div>
          </div>
          {hintLevel === 3 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Complete Solution:</strong> This hint contains the full solution. 
                Try to understand each part before implementing it.
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
