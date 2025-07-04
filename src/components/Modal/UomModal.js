import React, { useEffect } from 'react';
import { style } from 'src/configs/generalConfig';
import { Modal, Box, Typography, Button, Grid2 } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomTextField from 'src/components/CustomTextField';
import PropTypes from 'prop-types'

const UomSchema = yup.object().shape({
  unitName: yup
    .string()
    .required("Unit name can't be empty")
    .max(50, 'Unit name length should be <= 50'),
});

const UomModal = ({ open, onClose, editData, handleSubmitForm }) => {
  const {
    control,
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(UomSchema),
    defaultValues: {
      unitName: '',
    },
  });
  useEffect(() => {
    if (editData) {
      reset({ unitName: editData.uom_name || '' });
    }
  }, [editData, reset]);
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h4" className="my-2">
                    {editData?.uom_name ? 'Edit Uom' : 'Add Uom'}
                </Typography>
                <form onSubmit={handleSubmit(handleSubmitForm)}>
                    <Grid2 container spacing={2}>
                        <Grid2 xs={12} sm={6}>
                            <CustomTextField
                                name="unitName"
                                label="Unit Of Measurement"
                                control={control}
                            />
                        </Grid2>
                    </Grid2>

                    <Grid2 item xs={12} className="mt-3">
                        <Button variant="contained" sx={{ marginRight: 3.5 }} type="submit">
                            Save Changes
                        </Button>
                        <Button variant="outlined" color="primary" onClick={() => reset()}>
                            Reset
                        </Button>
                        <Button variant="outlined" color="error" sx={{ marginLeft: 3.5 }} onClick={onClose}>
                            Close
                        </Button>
                    </Grid2>
                </form>
            </Box>
        </Modal>
    )

}
 UomModal.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  editData: PropTypes.any,
  handleSubmitForm: PropTypes.any
}
export default UomModal;
