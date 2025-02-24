import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import { api } from 'src/utils/Rest-API';
import ProtectedRoute from 'src/components/ProtectedRoute';
import Head from 'next/head';
import { useLoading } from 'src/@core/hooks/useLoading';
import SnackbarAlert from 'src/components/SnackbarAlert';
import { useRouter } from 'next/router';
import { useAuth } from 'src/Context/AuthContext';
import ChatbotComponent from 'src/components/ChatbotComponent';
import AccessibilitySettings from 'src/components/AccessibilitySettings';
import { Grid2, TextField, Typography } from '@mui/material';

const Index = () => {
    const [esignStatus, setEsignStatus] = useState(false);
    const [auditLogs, setAuditLogs] = useState(false);
    const [codesGenerated, setCodesGenerated] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
    const [codeLength, setCodeLength] = useState('');
    const [productCodeLength, setProductCodeLength] = useState('');
    const [generateCode, setGenerateCode] = useState({ type: 'random', length: '', productCodeLength: '', errorMessage: '', isError: false, errorMessageProduct: '', isErrorProduct: false });
    const [crmUrl, setCrmUrl] = useState('');
    const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const { setIsLoading } = useLoading();
    const { removeAuthToken } = useAuth();
    const router = useRouter();
    useEffect(() => {
        getData();
    }, [codesGenerated]);

    const getData = async () => {
        setIsLoading(true);
        try {
            const response = await api(`/superadmin-configuration/`, {}, 'get', true);
            if (response.data.success && response.data.data.length > 0) {
                const config = response.data.data[0];
                setCodeLength(config.code_length)
                setProductCodeLength(config.product_code_length)
                console.log("config", config);
                setEsignStatus(config.esign_status);
                setAuditLogs(config.audit_logs);
                setCodesGenerated(config.codes_generated);
                setCrmUrl(config.crm_url);
                setGenerateCode({ ...generateCode, type: config.codes_type ?? 'random', length: config.code_length ?? '', productCodeLength: config.product_code_length ?? '', errorMessage: '', isError: false, errorMessageProduct: '', isErrorProduct: false });
            } else if (response.data.code === 401) {
                removeAuthToken();
                router.push('/401');
            }
        } catch (error) {
            console.error('Error fetching configurations:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleEsignStatusChange = (event) => {
        setEsignStatus(event.target.checked);
        setIsChanged(true);
    };
    const handleAuditLogsChange = (event) => {
        setAuditLogs(event.target.checked);
        setIsChanged(true);
    };
    const handleSaveChanges = () => {
        if (isChanged) {
            setOpenConfirm(true);
        }
    };
    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };
    const closeSnackbar = () => {
        setOpenSnackbar(false);
    };
    const confirmSaveChanges = async () => {
        setOpenConfirm(false);
        try {
            const response = await api(`/superadmin-configuration/`, {
                esign_status: esignStatus,
                audit_logs: auditLogs
            }, 'put', true);
            if (response?.data?.success) {
                setOpenSnackbar(true);
                setAlertData({ ...alertData, type: 'success', message: 'Configuration updated successfully' });
                getData();
            } else {
                setOpenSnackbar(true);
                setAlertData({ ...alertData, type: 'error', message: response.data?.message });
                if (response.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.error('Error updating configuration:', error);
        } finally {
            setIsChanged(false);
        }
    };

    const handleCloseGenerateDialog = () => {
        // setCodeLength('');
        // setProductCodeLength('');
        // setGenerateCode({ ...generateCode, length: '', productCodeLength: '', errorMessage: '', isError: false, errorMessageProduct: '', isErrorProduct: false });
        setOpenGenerateDialog(false);
    };

    const handleGenerateTypeChange = (event) => {
        setGenerateCode({ ...generateCode, type: event.target.value });
    };

    const handleCodeLength = (event) => {
        const intVal = parseInt(event.target.value);
        setCodeLength(event.target.value);
        if (intVal >= 6 && intVal <= 8) {
            setGenerateCode({ ...generateCode, length: intVal, errorMessage: '', isError: false });
            return;
        } else {
            setGenerateCode({ ...generateCode, length: intVal, errorMessage: 'Code length must be between 6 and 8', isError: true });
        }
    };

    const handleProductCodeLength = (event) => {
        const intVal = parseInt(event.target.value);
        setProductCodeLength(event.target.value);
        if (intVal >= 2 && intVal <= 4) {
            setGenerateCode({ ...generateCode, productCodeLength: intVal, errorMessageProduct: '', isErrorProduct: false });
            return;
        } else {
            setGenerateCode({ ...generateCode, productCodeLength: intVal, errorMessageProduct: 'Product Code length must be between 2 and 4', isErrorProduct: true });
        }
    };

    const handleGenerateCodes = async () => {
        try {
            if (!generateCode.length || generateCode.isError) {
                setGenerateCode({ ...generateCode, errorMessage: 'Code length must be between 6 and 8', isError: true });
                return;
            } else {
                setGenerateCode({ ...generateCode, errorMessage: '', isError: false });
            }
            if (!generateCode.productCodeLength || generateCode.isErrorProduct) {
                setGenerateCode({ ...generateCode, errorMessageProduct: 'Product Code length must be between 2 and 4', isErrorProduct: true });
                return;
            } else {
                setGenerateCode({ ...generateCode, errorMessageProduct: '', isErrorProduct: false });
            }
            setIsLoading(true);
            console.log("data ", {
                type: generateCode.type,
                codeLength: generateCode.length,
                productCodeLength: generateCode.productCodeLength
            })
            const response = await api(`/superadmin-configuration/generate`, {
                type: generateCode.type,
                codeLength: generateCode.length,
                productCodeLength: generateCode.productCodeLength
            }, 'post', true);
            console.log("Response of code generate ", response.data)
            if (response?.data?.success) {
                setOpenSnackbar(true);
                setAlertData({ ...alertData, type: 'success', message: 'Codes generated successfully' });
                setCodesGenerated(true);
                getData();
            } else {
                setOpenSnackbar(true);
                setAlertData({ ...alertData, type: 'error', message: 'Error generating codes' });
                if (response.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.error('Error generating codes:', error);
        } finally {
            setIsLoading(false);
            setOpenGenerateDialog(false);
        }
    };

    const handleCRMURL = async () => {
        try {
            const response = await api(`/superadmin-configuration/crm-url`, { url: crmUrl }, 'post', true);

            if (response?.data?.success) {
                setOpenSnackbar(true);
                setAlertData({ ...alertData, type: 'success', message: 'CRM URL saved successfully' });
            } else {
                setOpenSnackbar(true);
                setAlertData({ ...alertData, type: 'error', message: 'Error saved crm url' });
                if (response.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.error('Error in saved crm url:', error);
        }
    }

    return (
        <Box>
            <Head>
                <title>Superadmin Configuration</title>
            </Head>
            <Grid2 container spacing={2}>
                <Grid2 item xs={4} sm={4} md={4}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={esignStatus}
                                onChange={handleEsignStatusChange}
                                name="esignStatusToggle"
                                color="primary"
                                role='button'
                            />
                        }
                        label="Enable eSignStatus"
                    />
                </Grid2>
                <Grid2 item xs={4} sm={4} md={4}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={auditLogs}
                                onChange={handleAuditLogsChange}
                                name="auditLogsToggle"
                                color="primary"
                                role='button'
                            />
                        }
                        label="Enable Audit Logs"
                    />
                </Grid2>
                <Grid2 item xs={4} sm={4} md={4}>
                    <Button variant="contained" color="primary" onClick={handleSaveChanges}>
                        {'Save'}
                    </Button>
                </Grid2>
            </Grid2>

            <Grid2 container spacing={2} style={{ marginTop: '20px', marginBottom: '20px' }}>
                <Grid2 item xs={8} sm={8} md={8}>
                    <FormControl component="fieldset">
                        <RadioGroup
                            aria-label="generation-type"
                            name="generation-type"
                            value={generateCode.type}
                            onChange={handleGenerateTypeChange}
                            row={true}
                        >
                            <FormControlLabel value="random" control={<Radio />} label="Random Generated" />
                            <FormControlLabel value="sequential" control={<Radio />} label="Sequential Generated" />
                        </RadioGroup>
                    </FormControl>
                </Grid2>
                <Grid2 item xs={4} sm={4} md={4}>
                    <Button variant="contained" color="primary" onClick={() => { setOpenGenerateDialog(true) }}>
                        {'Generate Codes'}
                    </Button>
                </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
                <Grid2 item xs={6} sm={6} md={6} style={{ width: '40%' }}>
                    <FormControl component="fieldset" fullWidth>
                        <TextField
                            fullWidth
                            className='w-100'
                            id='crm-url'
                            label='CRM URL'
                            placeholder='Enter crm url'
                            value={crmUrl}
                            onChange={(e) => setCrmUrl(e.target.value)}
                        />
                    </FormControl>
                </Grid2>
                <Grid2 item xs={6} sm={6} md={6}>
                    <Button variant="contained" color="primary" onClick={handleCRMURL}>
                        {'Save'}
                    </Button>
                </Grid2>
            </Grid2>

            <Dialog
                open={openGenerateDialog}
                onClose={handleCloseGenerateDialog}
                aria-labelledby="generate-dialog"
            >
                <DialogContent>
                    <Grid2 container spacing={2}>
                        <Grid2 item xs={12} sm={12} md={12}>
                            <FormControl component="fieldset" fullWidth style={{ marginBottom: '20px' }}>
                                <TextField
                                    className='w-100'
                                    id='code-length'
                                    label='Code Length'
                                    placeholder='Enter code length 6 to 8'
                                    value={codeLength}
                                    onChange={handleCodeLength}
                                    required={true}
                                    error={generateCode.isError}
                                    helperText={generateCode.errorMessage}
                                />
                            </FormControl>
                        </Grid2>
                        <Grid2 item xs={12} sm={12} md={12}>
                            <FormControl component="fieldset" fullwidth>
                                <TextField
                                    className='w-100'
                                    id='product-code-length'
                                    label='Product code Length'
                                    placeholder='Enter product code length 2 to 4'
                                    value={productCodeLength}
                                    onChange={handleProductCodeLength}
                                    required={true}
                                    error={generateCode.isErrorProduct}
                                    helperText={generateCode.errorMessageProduct}
                                />
                            </FormControl>
                        </Grid2>
                    </Grid2>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' sx={{ marginRight: 3.5 }} color='error' onClick={handleCloseGenerateDialog}>
                        Close
                    </Button>
                    <Button disabled={!(productCodeLength && codeLength)} variant='contained' onClick={handleGenerateCodes}>
                        Generate
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openConfirm}
                onClose={handleCloseConfirm}
                aria-labelledby="confirm-dialog"
            >
                <Typography id="confirm-dialog" variant="h4" sx={{ mx: 4, mt: 8 }}>Confirm Save Changes</Typography>
                <DialogActions>
                    <Button variant='outlined' sx={{ marginRight: 3.5 }} color='error' onClick={handleCloseConfirm}>
                        Close
                    </Button>
                    <Button variant='contained' onClick={confirmSaveChanges}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
            <AccessibilitySettings />
            <ChatbotComponent />
        </Box>
    );
};

export default ProtectedRoute(Index);
