import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { Controller } from 'react-hook-form';
import PropTypes from 'prop-types'

const CustomDropdown = ({ name, label, control, options,onChange, disabled=false}) => {
  
  return (
    <Controller
      name={name}
      control={control}
      label={label}
      render={({ field, fieldState: { error } }) => (
       
        <FormControl fullWidth error={!!error}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select {...field} labelId={`${name}-label`} label={label}
           onChange={(e) => {
              field.onChange(e); // Update react-hook-form's state
              if (onChange) {
                onChange(e); // Call custom onChange if provided
              }
            }}
           disabled={disabled}>
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

CustomDropdown.propTypes = {
  name:PropTypes.any, 
  label:PropTypes.any,
   control:PropTypes.any, 
   options:PropTypes.any,
   onChange:PropTypes.any,
   disabled:PropTypes.any

}
export default CustomDropdown;