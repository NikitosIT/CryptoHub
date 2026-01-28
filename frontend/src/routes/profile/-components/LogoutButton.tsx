import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import { useLogout } from "@/routes/auth/-hooks/useLogout";

export function LogoutButton() {
  const [openDialog, setOpenDialog] = useState(false);
  const { handleLogout } = useLogout();

  const handleClick = () => {
    setOpenDialog(true);
  };

  const handleConfirm = async () => {
    setOpenDialog(false);
    await handleLogout();
  };

  const handleCancel = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          color: "#ef4444",
          "&:hover": {
            bgcolor: "rgba(239, 68, 68, 0.1)",
          },
        }}
      >
        Logout
      </Button>

      <Dialog
        open={openDialog}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            bgcolor: "#18181b",
            color: "#fff",
            border: "1px solid #27272a",
          },
        }}
      >
        <DialogTitle sx={{ color: "#fff" }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#a1a1aa" }}>
            Are you sure you want to logout? You will need to sign in again to
            access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            sx={{
              color: "#a1a1aa",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              void handleConfirm();
            }}
            sx={{
              color: "#ef4444",
              "&:hover": {
                bgcolor: "rgba(239, 68, 68, 0.1)",
              },
            }}
            autoFocus
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
