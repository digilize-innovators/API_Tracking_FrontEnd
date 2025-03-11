import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { FaEye } from 'react-icons/fa';
import { AiFillEyeInvisible } from 'react-icons/ai';

const CustomTextField = ({ name, label, control, rules, disabled, type }) => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          sx={{ mb: 3 }}
          fullWidth
          label={label}
          placeholder={label}
          error={!!error}
          helperText={error ? error.message : ''}
          disabled={disabled}
          type={type}
          InputProps={
            type === 'password'
              ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <FaEye /> : <AiFillEyeInvisible />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              : {}
          }
        />
      )}
    />
  );
};

CustomTextField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  rules: PropTypes.object,
  disabled: PropTypes.bool,
  type: PropTypes.string
}

CustomTextField.defaultProps = {
    disabled: false,
    type: 'text',
}

export default CustomTextField;