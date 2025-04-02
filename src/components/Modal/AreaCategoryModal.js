import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Box, Typography, Button ,Grid2} from '@mui/material';
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField';

// ✅ Define Yup Validation Schema
const AreaCategorySchema = yup.object().shape({
  areaCategoryName: yup
    .string()
    .trim()
    .required("Area category name can't be empty")
    .max(101, 'Area category name must be 101 characters or less')
    .matches(
      /^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/,
      'Area category name must contain only letters, numbers, and spaces'
    ),
});

const AreaCategoryModal = ({ open, onClose, editData, handleSubmitForm }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(AreaCategorySchema),
    defaultValues: { areaCategoryName: '' },
  });
  useEffect(() => {
    if (editData) {
      reset({ areaCategoryName: editData?.area_category_name || '' });
    }
  }, [editData, reset]);

  return (
    <Modal open={open} onClose={onClose} data-testid="modal" role="dialog" aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        {console.log(editData)}
        <Typography variant="h4" className="my-2">
          {editData?.id ? 'Edit Area Category' : 'Add Area Category'}
        </Typography>

        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2}>
            <Grid2 xs={12} sm={6}>
              <CustomTextField name="areaCategoryName"  label="Area Category"   control={control}   />
            </Grid2>
            
          </Grid2>

          <Grid2 item xs={12} className="mt-3">
            <Button variant="contained" sx={{ marginRight: 3.5 }} type="submit">
              Save Changes
            </Button>
            <Button type="reset" variant="outlined" color="primary" onClick={() => reset()}>
              Reset
            </Button>
            <Button variant="outlined" color="error" sx={{ marginLeft: 3.5 }} onClick={onClose}>
              Close
            </Button>
          </Grid2>
        </form>
      </Box>
    </Modal>
  );
};

export default AreaCategoryModal;
