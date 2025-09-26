import * as yup from 'yup'

const validationSchema = yup.object().shape({
  productId: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .max(20, 'Product ID length should be <= 20')
    .required("Product ID can't be empty"),

  commonNames: yup
    .string()
     .required("CAS Number is required")
    .max(255, 'Each name must be under 255 characters')
    .nullable(),

  apiName: yup
    .string()
    .required("API Name is required")
    .trim()
    .max(255, "Must be 255 characters or fewer"),

  casNumber: yup
    .string()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required("CAS Number is required")
    .max(12, "CAS Number must be at most 12 characters"),

  therapeuticCategory: yup
    .string()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .nullable()
  ,

  grades: yup
    .string()
    .trim()
    .required("Grade is required"),

  potency: yup
    .number()
    .typeError('Potency must be a number')
    .required('Potency is required')
    .min(0, 'Potency must be greater than or equal to 0'),

  purity: yup
    .number()
    .typeError('Purity must be a number')
    .required('Purity is required')
    .min(0, 'Purity must be at least 0%')
    .max(100, 'Purity cannot exceed 100%'),

  impurityLimits: yup
    .string()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .nullable(),

  shelfLife: yup
    .string()
    .transform(value => (value == null ? '' : String(value)))
    .required('Shelf life is required')
    .min(1, 'Shelf life must be at least 1 month')
    .trim(),

  storageConditions: yup
    .string()
    .transform(value => (value == null ? '' : String(value)))
    .required('Storage conditions are required')
    .trim(),

  msdsReference: yup
    .string()
    .transform(value => (value == null ? '' : String(value)))
    .nullable()
    .trim(),

  hazardClassification: yup
    .string()
    .transform(value => (value == null ? '' : String(value)))
    .nullable()
    .trim(),


  gtin: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .length(12, 'GTIN length should be 12')
    .required('GTIN is required'),


  containerSize: yup
    .string()
    .transform(value => (value == null ? '' : String(value)))
    .nullable()
    .trim(),

  status: yup
    .boolean()
    .required('Status is required'),

  country: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Country is required'),



  packagingHierarchy: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === '' || originalValue == null ? null : Number(originalValue)
    })
    .required('Packaging Hierarchy is required'),

  productNumber_unit_of_measurement: yup.string().required('Please Select Level 0 UOM'),

  productNumber: yup
    .number()
    .transform(value => {
      if (value === '' || value == null) {
        return 0
      }
      return isNaN(value) ? 0 : value
    })
    .required('Level 0 value should be greater than 0')
    .min(1, 'Level 0 value should be greater than 0')
    .max(100000, 'Level 0 value shoulde be less than 1 lakh'),

  firstLayer: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '') {
        return 0
      }
      const parsed = parseFloat(originalValue)
      return isNaN(parsed) ? null : parsed
    })
    .when('packagingHierarchy', (packagingHierarchy, schema) => {
      return packagingHierarchy[0] >= 2
        ? schema.required('Level 1 value should be greater than 0').min(1, 'Level 1 value should be greater than 0')
        : schema
    })
    .test('less-than-level0', 'Level 1 value should be less than level 0', function (value) {
      return !this.parent.productNumber || !value || value <= this.parent.productNumber
    })
    .test('divisible-level0', 'Level 1 value should be divisible with level 0 value', function (value) {
      return !this.parent.productNumber || !value || this.parent.productNumber % value === 0
    })
    .max(100000, 'Level 1 value shoulde be less than 1 lakh'),

  firstLayer_unit_of_measurement: yup.string().when('packagingHierarchy', {
    is: val => val >= 2,
    then: schema => schema.required('Please Select Level 1 UOM')
  }),

  secondLayer: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '') {
        return 0
      }
      const parsed = parseFloat(originalValue)
      return isNaN(parsed) ? null : parsed
    })
    .when('packagingHierarchy', (packagingHierarchy, schema) => {
      if (packagingHierarchy && packagingHierarchy.length > 0) {
        if (packagingHierarchy[0] >= 3) {
          return schema
            .required('Level 2 value should be greater than 0')
            .min(1, 'Level 2 value should be greater than 0')
        } else {
          return schema
        }
      } else {
        return schema
      }
    })
    .test('less-than-level1', 'Level 2 value should be less than level 1', function (value) {
      return !this.parent.firstLayer || !value || value <= this.parent.firstLayer
    })
    .test('divisible-level1', 'Level 2 value should be divisible by level 1 value', function (value) {
      return !this.parent.firstLayer || !value || this.parent.firstLayer % value === 0
    })
    .max(100000, 'Level 2 value shoulde be less than 1 lakh'),

  secondLayer_unit_of_measurement: yup.string().when('packagingHierarchy', {
    is: val => val >= 3,
    then: schema => schema.required('Please Select Level 2 UOM')
  }),

  thirdLayer: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '') {
        return 0
      }
      const parsed = parseFloat(originalValue)
      return isNaN(parsed) ? null : parsed
    })
    .when('packagingHierarchy', (packagingHierarchy, schema) => {
      if (packagingHierarchy && packagingHierarchy.length > 0) {
        if (packagingHierarchy[0] === 4) {
          return schema
            .required('Level 3 value should be greater than 0')
            .min(1, 'Level 3 value should be greater than 0')
        } else {
          return schema
        }
      } else {
        return schema
      }
    })
    .test('less-than-level2', 'Level 3 value should be less than level 2', function (value) {
      return !this.parent.secondLayer || !value || value <= this.parent.secondLayer
    })
    .test('divisible-level2', 'Level 3 value should be divisible by level 2 value', function (value) {
      return !this.parent.secondLayer || !value || this.parent.secondLayer % value === 0
    })
    .max(100000, 'Level 1 value shoulde be less than 1 lakh'),

  thirdLayer_unit_of_measurement: yup.string().when('packagingHierarchy', {
    is: val => val >= 4,
    then: schema => schema.required('Please Select Level 3 UOM')
  }),

  palletisation_applicable: yup.boolean().optional(),
  pallet_size: yup
    .number()
    .nullable() // Allow null values
    .transform((value, originalValue) => {
      // If the value is an empty string, transform it to undefined
      if (originalValue === '') {
        return 0
      }
      return value
    })
    .optional() // Allow the field to be optional
    .when('palletisation_applicable', {
      is: true,
      then: schema => schema.required('Pallet size is required').min(1, 'Pallet size should be greater than 0'),
      otherwise: schema => schema.nullable() // Allow null or undefined when not applicable
    }),
  file: yup.mixed().optional(),
  pallet_size_unit_of_measurement: yup
    .string()
    .optional()
    .when('palletisation_applicable', {
      is: true,
      then: schema => schema.required('Please Select Pallet Size UOM')
    }),
  productNumber_print: yup.boolean().optional(),
  firstLayer_print: yup.boolean().optional(),
  secondLayer_print: yup.boolean().optional(),
  thirdLayer_print: yup.boolean().optional(),
  productNumber_aggregation: yup.boolean().optional(),
  firstLayer_aggregation: yup.boolean().optional(),
  secondLayer_aggregation: yup.boolean().optional(),
  thirdLayer_aggregation: yup.boolean().optional(),

  

})
export default validationSchema