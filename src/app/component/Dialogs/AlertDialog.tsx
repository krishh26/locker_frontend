import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  ".MuiDialog-paper": {
    borderRadius: "4px",
    width: "420px",
    height: "220px",
  },
  ".MuiDialogTitle-root": {
    padding: "1rem",
  },
}));

const AlertDialog = (props) => {
  const { open, close, title, content, actionButton, cancelButton } = props;
  return (
    <BootstrapDialog
      open={open}
      onClose={close}
    >
      <DialogContent>
        <div className="flex justify-center mt-8">
          <img
            src="assets/images/svgImage/alert.svg"
            alt="Alert"
            className="w-36"
          />
        </div>
        <div className="font-bold text-center mt-8">{title}</div>
        <div className="mt-8 text-center">{content}</div>
        <div className="flex justify-center mt-10 gap-20">
          {cancelButton}
          {actionButton}
        </div>
      </DialogContent>
    </BootstrapDialog>
  );
};

export default AlertDialog;
