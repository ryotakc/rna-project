import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfettiFireworks } from './confetti-fireworks';


interface CalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  showConfetti: boolean;
}

export function CalendarDialog({ isOpen, onClose, message, showConfetti }: CalendarDialogProps) {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showConfetti && <ConfettiFireworks />}
    </>
  );
}

