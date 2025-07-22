import * as yup from "yup"
import { Modal, Box, Grid2, Typography, Button } from '@mui/material'
import { style } from 'src/configs/generalConfig';
import CustomTextField from "../CustomTextField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import PropTypes from 'prop-types'
import isValidIPv4 from "src/@core/utils/isValidIPv4";



const validationSchema = yup.object().shape({
    name: yup.string()
  .trim()
  .max(256, "Camera Name length should be less than 256")
  .required("Camera Name can't be empty")
  .test(
    'valid-camera-name',
    'Control Panel Name cannot contain any special symbols',
    (value) => {
      if (!value) return false;

      const validChars = /^[a-zA-Z0-9 ]+$/.test(value);  // only letters, numbers, and spaces
      const noDoubleSpaces = !/\s{2,}/.test(value);      // disallow consecutive spaces
      const noEdgeSpaces = value === value.trim();       // disallow leading/trailing space

      return validChars && noDoubleSpaces && noEdgeSpaces;
    }
  ),

    ip: yup.string()
        .trim()
        .required("IP Address can't be empty")
        .test("is-valid-ipv4", "Invalid IPv4 address", (value) => isValidIPv4(value)),

    port: yup.number()
        .typeError("Port Number must be a valid number")
        .integer("Port Number must be a valid number")
        .min(1, "Port Number must be between 1 and 65535")
        .max(65535, "Port Number must be between 1 and 65535")
        .required("Port Number can't be empty"),
});


function CameraModal({ openModal, handleClose, editData, handleSubmitForm }) {
    const { handleSubmit, control, reset } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            port: editData?.port || '',
            ip: editData?.ip || '',
            name: editData?.name || '',
        }
    });

    useEffect(() => {
        if (editData) {
            reset({
                port: editData?.port || '',
                ip: editData?.ip || '',
                name: editData?.name || '',
            });
        }
        if (!openModal) {
            reset({
                port: '',
                ip: '',
                name: ''
            })
        }
    }, [editData, openModal])

    return (
        <Modal
            open={openModal}
            onClose={handleClose}
            aria-labelledby='modal-modal-title'
            aria-describedby='modal-modal-description'
            data-testid="modal"
           
        >

            <Box sx={style}>
                <Typography variant='h4' className='my-2'>
                    {editData?.id ? 'Edit Camera' : 'Add Camera'}
                </Typography>
                <form onSubmit={handleSubmit(handleSubmitForm)}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <CustomTextField label='Camera Name *' name="name" control={control} />
                        </Grid2>
                        <Grid2 size={6}>
                            <CustomTextField label='IP Address *' name="ip" control={control} />
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <CustomTextField control={control} label='Port No. *' name="port" />
                        </Grid2>
                    </Grid2>
                    <Grid2 item xs={12} className='my-3 '>
                        <Button variant='contained' sx={{ marginRight: 3.5 }} type="submit">
                            Save Changes
                        </Button>
                        <Button type='reset' variant='outlined' color='primary' onClick={() => reset()} >
                            Reset
                        </Button>
                        <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleClose}>
                            Close
                        </Button>
                    </Grid2>
                </form>
            </Box>
        </Modal >
    )
}
CameraModal.propTypes={
openModal:PropTypes.any,
handleClose:PropTypes.any,
editData:PropTypes.any,
handleSubmitForm:PropTypes.any

}
export default CameraModal