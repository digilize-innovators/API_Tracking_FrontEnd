import React from 'react';
import { CiExport } from 'react-icons/ci';
import Box from '@mui/material/Box'
import { Button } from '@mui/material'
import PropTypes from 'prop-types';

const ExportResetActionButtons = ({ handleDownloadPdf, resetFilter }) => {
    return (
        <Box className='d-flex'>
            <Box>
                <Button variant='contained' style={{ display: 'inline-flex' }} onClick={handleDownloadPdf}>
                    <Box style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span>
                            <CiExport fontSize={20} />
                        </span>
                        <span style={{ marginLeft: 8 }}>Export</span>
                    </Box>
                </Button>
            </Box>
            <Box className='mx-2'>
                <Button variant='contained' style={{ display: 'inline-flex' }} onClick={resetFilter}>
                    Reset
                </Button>
            </Box>
        </Box>
    );
};
ExportResetActionButtons.propTypes = {
    handleDownloadPdf: PropTypes.any,
    resetFilter: PropTypes.any
}
export default ExportResetActionButtons;