import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { Controller } from 'react-hook-form';
// import PropTypes from 'prop-types';

const CustomDropdown = ({ name, label, control, options, disabled}) => {
  
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
       
        <FormControl fullWidth error={!!error}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select {...field} labelId={`${name}-label`} disabled={disabled}>
            {options?.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
};

CustomDropdown.defaultProps = {
  disabled: false
}
export default CustomDropdown;