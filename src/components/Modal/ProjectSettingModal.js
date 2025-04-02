import * as yup from 'yup'
import { api } from 'src/utils/Rest-API';
import { useLoading } from 'src/@core/hooks/useLoading';
import { useAuth } from 'src/Context/AuthContext';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import SnackbarAlert from '../SnackbarAlert';
import { style } from 'src/configs/generalConfig'
import {
    Button,
    Box,
    Grid2,
    Modal,
    Typography,
    FormHelperText,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Checkbox,
    ListItemText,
    OutlinedInput
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomDropdown from '../CustomDropdown';

const validationSchema = yup.object().shape({
    label: yup.string().required('Label is required'),
    dateFormat: yup.string().required('DateFormat is required'),
    selectedVariables: yup.array()
        .min(1, 'At least one variable must be selected')
        .required('No of Variable is requred'),
});

const ProjectSettings = ({ openModal, setOpenModal, projectSettingData, apiAccess, ip }) => {
    // console.log('Project setting data ', projectSettingData);
    const { setValue, reset ,control, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            label: "",
            dateFormat: "",
            noOfGroups: "",
            printPerGroup: "",
            selectedVariables: [],
        },
    });
    const [formData, setFormData] = useState()
    const [pendingAction, setPendingAction] = useState(null);
    const selectedVariables = watch('selectedVariables')
    const { setIsLoading } = useLoading()
    const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
    const [editId, setEditId] = useState(null);
    const { removeAuthToken } = useAuth();
    const router = useRouter();
    const [labels, setLabels] = useState([]);
    const [settingData, setSettingData] = useState({
        variables: [
            {
                label: 'MRP',
                value: 'MRP',
                checked: false
            },
            {
                label: 'NDC',
                value: 'NDC',
                checked: false
            },
            {
                label: 'GTIN',
                value: 'GTIN',
                checked: false
            },
            {
                label: 'Batch No',
                value: 'BatchNo',
                checked: false
            },
            {
                label: 'Manufacturing Date',
                value: 'ManufacturingDate',
                checked: false
            },
            {
                label: 'Expiry Date',
                value: 'ExpiryDate',
                checked: false
            },
            {
                label: 'Batch Size',
                value: 'BatchSize',
                checked: false
            },
            {
                label: 'USP',
                value: 'USP',
                checked: false
            },
            {
                label: 'Unique Code',
                value: 'UniqueCode',
                checked: false
            },
            {
                label: 'Country Code',
                value: 'CountryCode',
                checked: false
            }
        ]
    });

    console.log("selected variable ", selectedVariables)

    useEffect(() => {
        getPrintlineSetting();
        return () => {
        }
    }, []);

    useEffect(()=>{
        if(editId){
            reset({
            label: settingData?.label||"",
            dateFormat:settingData?.date_format|| "",
            noOfGroups:settingData?.no_of_groups|| "",
            printPerGroup:settingData?.print_per_group|| "",
            selectedVariables: settingData?.variables||[],
            })
        }
    },[editId,settingData])

    useEffect(() => {
        if (formData && pendingAction) {
            const esign_status = "approved";
            if (pendingAction === "edit") {
                editSetting();
            } else {
                addSetting(esign_status);
            }
            setPendingAction(null);
        }
    }, [formData, pendingAction]);

    const getPrintlineSetting = async () => {
        try {
            setIsLoading(true);
            console.log("Product Setting Line ", projectSettingData.lineId)
            const res = await api(`/printLineSetting/${projectSettingData.lineId}`, {}, 'get', true, true, ip);
            if (res.data.success && res.data.data) {
                setEditId(res.data.data.id);
                setSettingData({
                    ...res.data.data
                })
                

            } else {
                setSettingData({
                    ...settingData,
                })
            }
            setIsLoading(false);
        } catch (error) {
            console.log('Error to get printline setting ', error);
            setIsLoading(false);
        }
    }

    const addSetting = async () => {
        const data = {
            printerLineId: projectSettingData.lineId,
            label: formData.label,
            dateFormat: formData.dateFormat,
            noOfGroups: formData.noOfGroups.toString(),
            printPerGroup: formData.printPerGroup.toString(),
            variables: formData.selectedVariables
        };

        console.log('add setting data ', data)

        try {
            setIsLoading(true);
            const res = await api('/printLineSetting/', data, 'post', true, true, ip)
            console.log('Response add printLineSetting:', res.data);
            if (res.data.success) {
                setAlertData({ type: 'success', message: 'Printline setting added successfully', variant: 'filled', openSnackbar: true })
                setOpenModal(false)
            } else if (res.data.code === 401) {
                removeAuthToken();
                router.push('/401');
            } else {
                setAlertData({ type: 'error', message: res.data.error.details.message, variant: 'filled', openSnackbar: true })
            }
        } catch (error) {
            setOpenModal(false)
            console.error('Error applying settings:', error)
        } finally {
            setIsLoading(false);
        }
    }

    const editSetting = async () => {
        const data = {
            printerLineId: projectSettingData.lineId,
            label: formData.label,
            dateFormat: formData.dateFormat,
            noOfGroups: formData.noOfGroups.toString(),
            printPerGroup: formData.printPerGroup.toString(),
            variables: formData.selectedVariables
        };
        try {
            setIsLoading(true);
            const res = await api('/printLineSetting/', data, 'put', true, true, ip)
            console.log('Response update printLineSetting:', res.data);
            if (res.data.success) {
                setOpenModal(false)
                setAlertData({ type: 'success', message: 'Printline setting updated successfully', variant: 'filled', openSnackbar: true })
            }
            else if (res.data.code === 401) {
                removeAuthToken();
                router.push('/401');
            } else {
                setAlertData({ type: 'error', message: res.data.error.details.message, variant: 'filled', openSnackbar: true })
            }
        } catch (error) {
            setOpenModal(false)
            console.error('Error applying settings:', error)
        } finally {
            setIsLoading(false);
        }
    }

    const applySettings = async (data) => {
        console.log("Data :", data)
        setFormData(data)
        setPendingAction(editId ? "edit" : "add");
        // editId ? await editSetting() : await addSetting()
    }

    const closeModal = () => {
        setOpenModal(false)
    };


    const closeSnackbar = () => {
        setAlertData({ openSnackbar: false, type: '', message: '', variant: 'filled' })
    }

    const getLabels = async () => {
        console.log("getting lables");
        try {
            setIsLoading(true);
            setTimeout(() => { setIsLoading(false) }, 5000);
            const res = await api(`/batchprinting/getPrinterLabels/${projectSettingData.printerId}`, {}, 'get', true, true, ip);
            console.log('Get labels ', res?.data?.data)
            setIsLoading(false);
            console.log("Response :", res.data)
            if (res?.data.success) {
                setLabels(res.data?.data?.projectNames);
            }
        } catch (error) {
            console.error("Error to get print line setting")
            setIsLoading(false)
        }
    }

    const DateFormatsData = [
        'DD/MM/YYYY',
        'MM-DD-YY',
        'DD-MM-YY',
        'DD/MM/YY',
        'MM/YYYY',
        'MM-YYYY',
        'MMM.YYYY',
    ].map((dateFormat) => ({
        id: dateFormat,
        value: dateFormat,
        label: dateFormat
    }))

    const PrintPerGroupData = [1, 2, 3, 4, 5, 6].map((el) => ({
        id: el,
        value: el,
        label: el
    }))


    const GroupData = [1, 2, 3, 4].map((el) => ({
        id: el, value: el, label: el
    }))

    return (
        <>
            <Modal open={openModal} onClose={closeModal}>
                <Box sx={{ ...style, width: '40%' }}>
                    <Typography variant='h4' gutterBottom>
                        Project Settings
                    </Typography>
                    <Typography variant='h6'>Adjust the settings to customize.</Typography>
                    <form onSubmit={handleSubmit(applySettings)}>
                        <Grid2 container spacing={2} margin={'1rem 0rem'}>
                            <Grid2 size={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="label">Label</InputLabel>
                                    <Controller
                                        name="label"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                labelId="label"
                                                id="label"
                                                fullWidth
                                                onOpen={getLabels} // Fetch labels when dropdown opens
                                            >
                                                {labels?.map((item, index) => (
                                                    <MenuItem key={index} value={item}>
                                                        {item}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </FormControl>
                            </Grid2>

                            <Grid2 size={6}>
                                <CustomDropdown
                                    label={"Date Format"}
                                    control={control}
                                    name={"dateFormat"}
                                    options={DateFormatsData}
                                />
                            </Grid2>
                        </Grid2>

                        <Grid2 container spacing={3} sx={{ marginTop: '1rem' }}>
                            <Grid2 size={6}>
                                <CustomDropdown
                                    label="No. of group"
                                    name="noOfGroups"
                                    control={control}
                                    options={GroupData}
                                />
                            </Grid2>
                            <Grid2 size={6}>
                                <CustomDropdown
                                    label="Print Per Group"
                                    name={"printPerGroup"}
                                    control={control}
                                    options={PrintPerGroupData}
                                />

                            </Grid2>
                        </Grid2>

                        <Grid2 container spacing={1} sx={{ marginTop: '1rem' }}>
                            <Grid2 size={12}>
                                <FormControl sx={{ width: "100%" }} error={!!errors.selectedVariables}>
                                    <InputLabel id="no-of-variable">No of Variable</InputLabel>
                                    <Controller
                                        name="selectedVariables"
                                        control={control}
                                        rules={{ required: "No of Variable is required" }} // Validation Rule
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                labelId="no-of-variable"
                                                id="no-of-variable"
                                                multiple
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8,
                                                            width: 250
                                                        }
                                                    }
                                                }}
                                                renderValue={(selected) => selected.join(", ")}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setValue("selectedVariables", value, {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                        shouldTouch: true
                                                    });
                                                }}
                                                input={<OutlinedInput label="No of Variable" />}
                                            >
                                                {settingData.variables?.map((item, index) => (
                                                    <MenuItem key={index} value={item.value}>
                                                        <Checkbox checked={field.value.includes(item.value)} />
                                                        <ListItemText primary={item.label} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    {errors.selectedVariables && (
                                        <FormHelperText>{errors.selectedVariables.message}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid2>
                        </Grid2>
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            {
                                apiAccess?.addApiAccess && (
                                    <Button variant='contained' type="submit" sx={{ minWidth: 100 }}>
                                        Apply
                                    </Button>
                                )
                            }
                            <Button
                                variant='outlined'
                                color='error'
                                onClick={() => {
                                    setOpenModal(!openModal)
                                }}
                                sx={{ minWidth: 100 }}
                            >
                                Close
                            </Button>
                        </Box>
                    </form>

                </Box>
            </Modal >
            <SnackbarAlert openSnackbar={alert.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
        </>
    )
}


export default ProjectSettings