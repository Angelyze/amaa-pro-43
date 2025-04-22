
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DeleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}

const DeleteProfileDialog = ({ open, onOpenChange, userId, userEmail }: DeleteProfileDialogProps) => {
  const { signOut } = useAuth();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (input !== userEmail) {
      toast.error("Email address does not match. Please type your email to confirm.");
      return;
    }
    setLoading(true);
    try {
      // Delete all profile/account data, then the user (cascade!)
      await supabase.from("profiles").delete().eq("id", userId);
      // Optionally: delete user content/messages/convos/subs if needed (not included here)

      // Delete Auth user (using Supabase Admin API via Edge Function in a real prod app, but here we call user yourself)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast.success("Account deleted.");
      onOpenChange(false);
      // Log user out and redirect out of app
      setTimeout(() => {
        signOut();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Could not delete profile.");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action is <span className="font-semibold text-destructive">irreversible</span>.<br />
            To confirm, enter your email: <span className="break-all">{userEmail}</span>
          </DialogDescription>
        </DialogHeader>
        <input
          className="border px-3 py-2 rounded w-full mt-2"
          placeholder="Type your email here to confirm"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            Delete Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default DeleteProfileDialog;
