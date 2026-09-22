"use client";

import React, { useState } from "react";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface SiteVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  landId: string;
  landTitle: string;
}

export const SiteVisitModal: React.FC<SiteVisitModalProps> = ({
  isOpen,
  onClose,
  landId,
  landTitle,
}) => {
  const [preferredDate, setPreferredDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api.post("/api/site-visits", {
        landId,
        preferredDate,
        notes: notes || undefined,
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Site Visit request error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    setPreferredDate("");
    setNotes("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Site Visit">
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="p-3 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 w-max mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white">Site Visit Request Submitted!</h4>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            Your request for <strong>{landTitle}</strong> has been submitted. Platform admins will verify scheduling and reach out shortly.
          </p>
          <Button onClick={handleClose} variant="primary" className="w-full mt-2">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Request an in-person site visit for <strong className="text-white">{landTitle}</strong>. An admin will coordinate visit logistics.
          </p>

          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          <Input
            label="Preferred Visit Date & Time"
            type="datetime-local"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />

          <Textarea
            label="Special Instructions / Notes (Optional)"
            placeholder="Specify preferred timing, transportation requirements, or questions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Confirm Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
