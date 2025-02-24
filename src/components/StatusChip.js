import React from 'react';
import TableCell from '@mui/material/TableCell';
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';

const StatusChip = ({ label, color }) => {
    return (
        <TableCell
            align="center"
            className="p-2"
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
        >
            <Chip
                label={label}
                color={color || 'default'}
                sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                    '& .MuiChip-label': { fontWeight: 500 },
                }}
            />
        </TableCell>
    );
};
StatusChip.propTypes = {
    label: PropTypes.any,
    color: PropTypes.any
};
export default StatusChip;