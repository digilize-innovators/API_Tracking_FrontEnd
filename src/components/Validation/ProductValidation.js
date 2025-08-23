import * as yup from 'yup'

const validationSchema = yup.object().shape({
  productId: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .max(20, 'Product ID length should be <= 20')
    .required("Product ID can't be empty"),

  productName: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .max(50, 'Product Name length should be <= 50')
    .matches(
      /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/,
      'Product name can only contain letters, numbers, and single spaces between words'
    )
    .required("Product Name can't be empty"),

  gtin: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .length(12, 'GTIN length should be 12')
    .required('GTIN is required'),
  mrp: yup
    .number()
    .transform(value => {
      if (value === '' || value == null) {
        return 0
      }
      return isNaN(value) ? 0 : value
    })
    .min(0, 'MRP cannot be negative')
    .max(100000000, 'Level 1 value shoulde be less')
    .required('MRP is required'),

  foreignName: yup
    .string()
    .optional()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .max(50, 'Generic Name length should be <= 50')
    .notRequired(),

  packagingSize: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .max(100000, 'Packaging Size length should be <= 100000')
    .optional(),

  companyUuid: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : value))
    .trim()
    .required('Company is required'),

  prefix: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : value))
    .trim()
    .required('Prefix is required'),

  country: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Country is required'),

  unit_of_measurement: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Uom is required'),

  no_of_units_in_primary_level: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .max(100000, 'No Of Units In Primary Level length should be <= 100000')
    .required('No Of Units In Primary Level is required'),

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
   description: yup.string()
    .required('Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
   division:yup.string().required('select Division') ,
   itemNo:yup.string().required('Item No is required')
   .max(100,'Item No cannot exceed 100 Character'),
   itemCategory:yup.string()
   .required('Item Category is require')
   .max(100,'Item Category cannot exceed 100 character'),
   diameter:yup.number()
    .typeError('Diameter must be a number')
    .max(10000, 'Diameter cannot exceed 10000')
    .nullable()
    .optional(),
   length:yup.number()
    .typeError('length must be a number')
    .max(10000, 'length cannot exceed 10000')
    .nullable()
    .optional(),

   intendedUser:yup.string()
   .max(20,'User type cannot exceed 20 character')
   .optional(),
   catherLength: yup.number()
    .typeError('Cather length must be a number')
    .max(1000, 'Cather length cannot exceed 1000')
    .nullable()
    .optional(),
    platformType:yup.string()
    .max(100, 'Platform type cannot exceed 100 characters')
    .nullable()
    .optional(),
    compatibleProsthetics:yup.string()
    .max(500,'Compatible Prosthetics cannot exceed 500 characters')
    .nullable()
    .optional(),
    compatibeGuideWireSize:yup.string()
    .max(50,'Compatible size cannot exceed 50 characters')
    .nullable()
    .optional(),
    surfaceTreatment:yup.string()
    .max(255,'Surface treatment cannot exceed 255 characters')
    .nullable()
    .optional(),
    materialComposition:yup.string()
    .max(500,'Material composition size cannot exceed 500 characters')
    .nullable()
    .optional(),
    deliverSystemType:yup.string()
    .max(100,'System type cannot exceed 100 characters')
    .nullable()
    .optional(),

})
export default validationSchema