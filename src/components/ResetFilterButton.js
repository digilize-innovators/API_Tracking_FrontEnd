import React from 'react';
import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';

const ResetFilterButton = ({ resetFilter }) => {
  return (
    <Box className='mx-2'>
        <Button variant='contained' style={{ display: 'inline-flex' }} onClick={resetFilter}>
            Reset
        </Button>
    </Box>
  )
}

export default ResetFilterButton;

ResetFilterButton.propTypes = {
    resetFilter: PropTypes.func.isRequired
}