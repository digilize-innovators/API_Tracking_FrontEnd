import { useState, Fragment, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import { BsPencilSquare } from "react-icons/bs";
import { useSettings } from '../@core/hooks/useSettings';
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler';
import { api } from 'src/utils/Rest-API.js';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const fontOptions = ['Arial', 'Times', 'Calibri', 'Roboto'];
const fontSizeLabels = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const fontSizeValues = [10, 12, 14, 16, 18, 20];
const colorOptions = ['#50BDA0', '#DDF0E1', '#548A65', '#00A980', '#34A59C'];

const AccessibilitySettings = () => {
    const { settings, saveSettings } = useSettings();
    const [openModal, setOpenModal] = useState(false);
    const [fontSize, setFontSize] = useState(settings.fontSize || 14);
    const [font, setFont] = useState(settings.fontFamily);
    const [color, setColor] = useState(settings.themeColor);
    const [userId, setUserId] = useState('')
    const toggleModal = () => setOpenModal(!openModal);

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserId(decodedToken.userId)
        }
    }, []);

    const applySettings = async () => {
        console.log("settings", settings);
        console.log("data", font, fontSize, color);

        const data = {};
        data.AccessibilitySettings = {
            fontFamily: font,
            fontSize: fontSize,
            themeColor: color,
            mode: settings.mode,
        }
        data.userId = { userId }
        console.log("data put accessibility", data)

        try {
            const res = await api('/accessibility/', data, 'put', true);
            console.log("Response from API:", res);

            saveSettings({
                fontFamily: font,
                fontSize: fontSize,
                themeColor: color,
                mode: settings.mode
            });
            toggleModal();
        } catch (error) {
            console.error("Error applying settings:", error);
        } finally {
            console.log("Updated successfully")
        }
    };

    return (
        <Fragment>
            <Box
                sx={{
                    position: 'fixed',
                    right: 0,
                    top: '20%',
                    transform: 'translateY(-50%)',
                    zIndex: 1300,
                    width: 42,
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: settings.themeColor,
                    borderRadius: '10px 0 0 10px',
                }}
            >
                <IconButton onClick={toggleModal} disabled={openModal} sx={{ color: 'white', padding: 0 }}>
                    <BsPencilSquare />
                </IconButton>
            </Box>

            <Modal open={openModal} onClose={toggleModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 460,
                        bgcolor: 'background.paper',
                        borderRadius: '12px',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h4" gutterBottom>Accessibility Settings</Typography>
                    <Typography variant="h6" >Adjust the settings to customize.</Typography>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>Font Settings</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            {fontOptions.map(option => (
                                <Button
                                    key={option}
                                    onClick={() => setFont(option)}
                                    variant={font === option ? 'contained' : 'outlined'}
                                    sx={{ minWidth: 80 }}
                                >
                                    {option}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            mt: 3,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Slider
                            value={fontSize}
                            onChange={(e, newValue) => setFontSize(newValue)}
                            step={null}
                            marks={fontSizeValues.map((value, index) => ({
                                value,
                                label: fontSizeLabels[index],
                            }))}
                            min={10}
                            max={20}
                            sx={{
                                color: settings.themeColor || '#50BDA0',
                                width: '90%',
                                maxWidth: '400px',
                                mx: 'auto',
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            mt: 4,
                            p: 2,
                            border: '1px dashed grey',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: `${fontSize}px`,
                            fontFamily: font,
                        }}
                    >
                        This is a preview of your selected font and size.
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Theme Settings
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {colorOptions.map((option) => (
                                <Box
                                    key={option}
                                    onClick={() => setColor(option)}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: option,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border:
                                            option === color
                                                ? `3px solid black`
                                                : '2px solid transparent',
                                        transition: 'border 0.2s',
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>Theme Mode</Typography>
                        <ModeToggler settings={settings} saveSettings={saveSettings} />
                    </Box>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="contained" onClick={applySettings} sx={{ minWidth: 100 }}>
                            Apply
                        </Button>
                        <Button variant="outlined" color="error" onClick={toggleModal} sx={{ minWidth: 100 }}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Fragment>
    );
};

export default AccessibilitySettings;
