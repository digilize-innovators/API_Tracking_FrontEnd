import React from 'react';
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import { MenuItem } from '@mui/material'
import PropTypes from 'prop-types'

const EsignStatusFilter = ({ esignStatus, setEsignStatus }) => {
    return (
        <FormControl className='w-25'>
            <InputLabel id='esign-status'>E-Sign</InputLabel>
            <Select
                role="combobox"
                labelId='esign-status'
                id='esign-status-id'
                value={esignStatus}
                label='E-Sign'
                onChange={e => setEsignStatus(e.target.value)}
            >
                <MenuItem value={''}> {'None'} </MenuItem>
                <MenuItem value={'Approved'}> {'Approved'} </MenuItem>
                <MenuItem value={'Pending'}> {'Pending'} </MenuItem>
                <MenuItem value={'Rejected'}> {'Rejected'} </MenuItem>
            </Select>
        </FormControl>
    );
};

EsignStatusFilter.propTypes = {
    esignStatus: PropTypes.any,
    setEsignStatus: PropTypes.any,
};

export default EsignStatusFilter;