
import React from 'react';
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import { MenuItem } from '@mui/material'
import PropTypes from 'prop-types'

const EsignStatusDropdown = ({ tableHeaderData, setTableHeaderData }) => {
    const handleDropdown = (e)=> {
        console.log("e sign ", e.target.value);
        
        setTableHeaderData({ ...tableHeaderData, esignStatus: e.target.value });
    }
    return (
        <FormControl className='w-25'>
            <InputLabel id='esign-status'>E-Sign</InputLabel>
            <Select
                role="combobox"
                labelId='esign-status'
                id='esign-status-id'
                value={tableHeaderData.esignStatus}
                label='E-Sign'
                onChange={handleDropdown}
            >
                <MenuItem value={''}> {'None'} </MenuItem>
                <MenuItem value={'Approved'}> {'Approved'} </MenuItem>
                <MenuItem value={'Pending'}> {'Pending'} </MenuItem>
                <MenuItem value={'Rejected'}> {'Rejected'} </MenuItem>
            </Select>
        </FormControl>
    );
};

EsignStatusDropdown.propTypes = {
    tableHeaderData: PropTypes.object,
    setTableHeaderData: PropTypes.func,
};

EsignStatusDropdown.defaultProps = {
    esignStatus: ''
}

export default EsignStatusDropdown;