import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import PropTypes from 'prop-types';

const DialogBox = ({ open, onClose, onConfirm }) => {
  console.log('DialogBox Rendered');

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">Confirm Logout</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          You are already logged in on another device. Do you want to log out from all devices and log in here?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button> {/* Fixed: Use onClose instead of setOpenConfirmDialog */}
        <Button onClick={onConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};
DialogBox.propTypes={
  open:PropTypes.any,
  onClose:PropTypes.any,
  onConfirm:PropTypes.any
}

export default React.memo(DialogBox);
