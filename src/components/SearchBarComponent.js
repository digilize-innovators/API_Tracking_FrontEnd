import React from 'react';
import Box from '@mui/material/Box'
import { TextField, Button } from '@mui/material';
import { IoMdSearch } from 'react-icons/io'
import PropTypes from 'prop-types';

const SearchBar = ({ searchValue, handleSearchChange, handleSearchClick }) => {
    return (
        <Box display="flex" alignItems="center">
            <Box className='mx-2'>
                <TextField
                    type='search'
                    size='small'
                    style={{ height: '40px' }}
                    id='outlined-basic'
                    label='Search'
                    variant='outlined'
                    value={searchValue}
                    onChange={handleSearchChange}
                />
            </Box>
            <Box className='mx-2'>
                <Button variant='contained' className='py-2' onClick={handleSearchClick}>
                    <span>
                        <IoMdSearch size={24} style={{ fontSize: '1.5em' }} />
                    </span>
                </Button>
            </Box>
        </Box>
    );
};

SearchBar.propTypes = {
    searchValue: PropTypes.any,
    handleSearchChange: PropTypes.any,
    handleSearchClick: PropTypes.any
}

export default SearchBar;
