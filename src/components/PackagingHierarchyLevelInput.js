import React from 'react';
import PropTypes from 'prop-types';
import { FormControlLabel, Switch, Grid2, } from '@mui/material';
import CustomTextField from './CustomTextField';
import CustomDropdown from './CustomDropdown';
import { Controller, useFormContext } from 'react-hook-form';

function PackagingHierarchyLevelInput({ level, label, uomOptions }) {
  const { control, setValue } = useFormContext();
  const levelValueMap = {
  0: 'productNumber',
  1: 'firstLayer', 
  2: 'secondLayer',
  3: 'thirdLayer'
};
  const levelValueName = levelValueMap[level] ?? 'thirdLayer';
  const levelUomName = `${levelValueName}_unit_of_measurement`;
  const levelPrintName = `${levelValueName}_print`;
  const levelAggregationName = `${levelValueName}_aggregation`;

  return (
    <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
      <Grid2 size={4}>
        <CustomTextField
          control={control}
          label={`${label} Level`}
          name={levelValueName}
          type='number'
        />
      </Grid2>
      <Grid2 size={3}>
        <CustomDropdown
          control={control}
          label={`${label} Level Uom`}
          name={levelUomName}
          options={uomOptions}
        />
      </Grid2>
      <Grid2 size={2}>
        <Controller
          name={levelPrintName}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  {...field}
                  checked={field.value}
                  name={levelPrintName}
                  color='primary'
                />
              }
            />
          )}
        />
      </Grid2>
      <Grid2 size={2}>
        <Controller
          name={levelAggregationName}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  {...field}
                  checked={field.value}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    if (isChecked) {
                      setValue(levelPrintName, isChecked);
                    }
                    field.onChange(isChecked);
                  }}
                  name={levelAggregationName}
                  color='primary'
                />
              }
            />
          )}
        />
      </Grid2>
    </Grid2>
  );
}

PackagingHierarchyLevelInput.propTypes = {
  level: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  uomOptions: PropTypes.array.isRequired,
};

export default PackagingHierarchyLevelInput;