import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Box, Typography, Button, Grid2 } from '@mui/material';
import { style } from 'src/configs/generalConfig';
import CustomTextField from 'src/components/CustomTextField';
import CustomDropdown from 'src/components/CustomDropdown';

const MAX_PRINTER_ID_LENGTH = 50;

const PrinterMasterSchema = yup.object().shape({
    printerCategoryId: yup
      .string()
      .trim()
      .required("Printer category can't be empty"),
  
    printerId: yup
      .string()
      .trim()
      .matches(/^[a-zA-Z0-9]+$/, "Printer ID cannot contain any special symbols")
      .max(MAX_PRINTER_ID_LENGTH, "Invalid Printer ID")
      .required("Printer can't be empty"),
  
    printerIp: yup
      .string()
      .trim()
      .matches(
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        "Invalid IP address"
      )
      .required("Printer IP can't be empty"),
  
    printerPort: yup
      .string()
      .trim()
      .matches(
        /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/,
        "Invalid port number"
      )
      .required("Printer port can't be empty"),
  });
function PrinterMasterModal({ open, onClose, editData, handleSubmitForm, allPrinterCategory }) {
    const printerCategoryOptions = allPrinterCategory?.map((item) => ({
        id: item.id,
        value: item.id,
        label: item.printer_category_name,
    }));
    console.log(printerCategoryOptions)

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: yupResolver(PrinterMasterSchema),
        defaultValues: {
            printerId: editData?.printer_id || '',
            printerCategoryId: editData?.printer_category_id || '',
            printerPort: editData?.printer_port || '',
            printerIp: editData?.printer_ip || '',
        },
    });

    useEffect(() => {
        if (editData) {
            reset({
                printerId: editData?.printer_id || '',
                printerCategoryId: editData?.printer_category_id || '',
                printerPort: editData?.printer_port || '',
                printerIp: editData?.printer_ip || '',
            });
        }
    }, [editData]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            role="dialog"
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description">
            <Box sx={style}>
                <Typography variant="h4" className="my-2">
                    {editData?.id ? 'Edit Printer Master' : 'Add Printer Master'}
                </Typography>
                <form onSubmit={handleSubmit(handleSubmitForm)}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <CustomTextField
                                name="printerId"
                                label="Printer ID"
                                control={control}
                            />
                        </Grid2>
                        <Grid2 size={6}>
                            <CustomDropdown
                                name="printerCategoryId"
                                label="Printer Category"
                                control={control}
                                options={printerCategoryOptions}
                            />
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <CustomTextField
                                name="printerPort"
                                label="Printer Port"
                                control={control}
                            />
                        </Grid2>
                        <Grid2 size={6}>
                            <CustomTextField
                                name="printerIp"
                                label="Printer IP"
                                control={control}
                            />
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
}

export default PrinterMasterModal;