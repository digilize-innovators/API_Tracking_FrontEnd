import React, { useState, forwardRef, useImperativeHandle } from 'react';
import Box from '@mui/material/Box';
import { TextField, Button } from '@mui/material';
import { IoMdSearch } from 'react-icons/io';
import PropTypes from 'prop-types';

const CustomSearchBar = forwardRef(({ handleSearchClick }, ref) => {
    const [searchVal, setSearchVal] = useState('');

    const handleSearchChange = (e) => {
        setSearchVal(e.target.value);
    };

    const handleClick = () => {
        handleSearchClick(searchVal);
    };

    // Expose reset method to parent using useImperativeHandle
    useImperativeHandle(ref, () => ({
        resetSearch: () => setSearchVal('')
    }));

    return (
        <Box display="flex" alignItems="center">
            {console.log('renderCustom search bar')}
            <Box className='mx-2'>
                <TextField
                    type='search'
                    size='small'
                    style={{ height: '40px' }}
                    id='outlined-basic'
                    label='Search'
                    variant='outlined'
                    value={searchVal}
                    onChange={handleSearchChange}
                />
            </Box>
            <Box className='mx-2'>
                <Button variant='contained' className='py-2' onClick={handleClick}>
                    <span>
                        <IoMdSearch size={24} style={{ fontSize: '1.5em' }} />
                    </span>
                </Button>
            </Box>
        </Box>
    );
});

CustomSearchBar.propTypes = {
    handleSearchClick: PropTypes.func.isRequired
};

export default CustomSearchBar;
