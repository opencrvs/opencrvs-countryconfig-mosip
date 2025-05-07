/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { MessageDescriptor } from 'react-intl'
import { formMessageDescriptors } from './messages'
import { SerializedFormField, Conditional } from '../types/types'
import {
  educationalAttainmentOptions,
  maritalStatusOptions
} from './select-options'
import { certificateHandlebars } from '../birth/certificate-handlebars'
import { getFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { Validator } from '../types/validators'

const exactDobConditional: Conditional[] = [
  {
    action: 'hide',
    expression: '!window.config.FEATURES.DATE_OF_BIRTH_UNKNOWN'
  }
]

export const exactDateOfBirthUnknown = (
  conditionalCase: Conditional[]
): SerializedFormField => ({
  name: 'exactDateOfBirthUnknown',
  type: 'CHECKBOX',
  label: {
    defaultMessage: 'Exact date of birth unknown',
    description: 'Checkbox for exact date of birth unknown',
    id: 'form.field.label.exactDateOfBirthUnknown'
  },
  hideInPreview: true,
  required: false,
  hideHeader: true,
  initialValue: false,
  validator: [],
  conditionals: exactDobConditional.concat(conditionalCase),
  mapping: {
    query: {
      operation: 'booleanTransformer'
    },
    mutation: {
      operation: 'ignoreFieldTransformer'
    }
  }
})

export const getAgeOfIndividualInYears = (
  label: MessageDescriptor,
  conditionals: Conditional[],
  validators: Validator[],
  certificateHandlebar?: string
): SerializedFormField => ({
  name: 'ageOfIndividualInYears',
  type: 'NUMBER',
  label,
  required: true,
  initialValue: '',
  validator: validators,
  conditionals,
  postfix: 'years',
  ...(certificateHandlebar && {
    mapping: getFieldMapping('ageOfIndividualInYears', certificateHandlebar)
  })
})

export const getMaritalStatus = (
  certificateHandlebar: string,
  conditionals: Conditional[]
): SerializedFormField => ({
  name: 'maritalStatus',
  type: 'SELECT_WITH_OPTIONS',
  label: {
    defaultMessage: 'Marital status',
    description: 'Label for form field: Marital status',
    id: 'form.field.label.maritalStatus'
  },
  required: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: getFieldMapping('maritalStatus', certificateHandlebar),
  conditionals,
  options: maritalStatusOptions
})

export function registrationEmail(
  sectionId: string,
  conditionals: Conditional[] = []
): SerializedFormField {
  const fieldName: string = `${sectionId}Email`
  const fieldId: string = `birth.${sectionId}.${sectionId}-view-group.${fieldName}`
  return sectionId === 'informant'
    ? {
        name: 'registrationEmail',
        type: 'TEXT',
        label: formMessageDescriptors.email,
        required: false,
        initialValue: '',
        validator: [
          {
            operation: 'emailAddressFormat'
          }
        ],
        conditionals,
        mapping: getFieldMapping(
          'registrationEmail',
          certificateHandlebars.contactEmail
        )
      }
    : {
        name: fieldName,
        type: 'TEXT',
        label: formMessageDescriptors.email,
        required: false,
        initialValue: '',
        validator: [
          {
            operation: 'emailAddressFormat'
          }
        ],
        conditionals,
        customQuestionMappingId: fieldId,
        custom: true,
        mapping: getCustomFieldMapping(fieldId)
      }
}

export function registrationPhone(
  sectionId: string,
  conditionals: Conditional[] = []
): SerializedFormField {
  const fieldName: string = `${sectionId}Mobile`
  const fieldId: string = `birth.${sectionId}.${sectionId}-view-group.${fieldName}`
  return sectionId === 'informant'
    ? {
        name: 'registrationPhone',
        type: 'TEL',
        label: formMessageDescriptors.phoneNumber,
        required: false,
        initialValue: '',
        validator: [
          {
            operation: 'phoneNumberFormat'
          }
        ],
        conditionals,
        mapping: getFieldMapping(
          'registrationPhone',
          certificateHandlebars.contactPhoneNumber
        )
      }
    : {
        name: fieldName,
        type: 'TEL',
        label: formMessageDescriptors.phoneNumber,
        required: false,
        initialValue: '',
        validator: [
          {
            operation: 'phoneNumberFormat'
          }
        ],
        conditionals,
        customQuestionMappingId: fieldId,
        custom: true,
        mapping: getCustomFieldMapping(fieldId)
      }
}

export const divider = (
  name = 'seperator',
  conditionals?: Conditional[]
): SerializedFormField => ({
  name,
  type: 'DIVIDER',
  label: {
    defaultMessage: ' ',
    description: 'empty string',
    id: 'form.field.label.empty'
  },
  initialValue: '',
  ignoreBottomMargin: true,
  validator: [],
  conditionals
})

// This optional field is used to validate user input with an externally integrated national ID system
export const getNIDVerificationButton = (
  fieldName: string,
  conditionals: Conditional[],
  validator: any[]
): SerializedFormField => ({
  name: fieldName,
  type: 'NID_VERIFICATION_BUTTON',
  label: formMessageDescriptors.iDTypeNationalID,
  required: true,
  initialValue: '',
  validator,
  conditionals,
  mapping: getFieldMapping('nationalIdVerification'),
  labelForVerified: formMessageDescriptors.nidVerified,
  labelForUnverified: formMessageDescriptors.nidNotVerified,
  labelForOffline: formMessageDescriptors.nidOffline
})
export const getOccupation = (
  certificateHandlebar: string,
  conditionals: Conditional[] = []
): SerializedFormField => ({
  name: 'occupation',
  type: 'TEXT',
  label: {
    defaultMessage: 'Occupation',
    description: 'text for occupation form field',
    id: 'form.field.label.occupation'
  },
  required: false,
  initialValue: '',
  validator: [],
  conditionals,
  mapping: getFieldMapping('occupation', certificateHandlebar)
})

export const getEducation = (
  certificateHandlebar: string
): SerializedFormField => ({
  name: 'educationalAttainment',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.educationAttainment,
  required: false,
  initialValue: '',
  validator: [],
  conditionals: [
    {
      action: 'hide',
      expression: '!values.detailsExist'
    }
  ],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: educationalAttainmentOptions,
  mapping: getFieldMapping('educationalAttainment', certificateHandlebar)
})

export const informantsSignature = {
  name: 'informantSignature',
  label: {
    defaultMessage: 'Signature of informant',
    description: 'Label for informants signature input',
    id: 'review.inputs.informantsSignature'
  },
  validator: [],
  type: 'SIGNATURE',
  allowedFileFormats: ['image/png', 'image/svg'],
  mapping: {
    mutation: {
      operation: 'fieldValueSectionExchangeTransformer',
      parameters: ['registration', 'informantsSignature']
    },
    query: {
      operation: 'fieldValueSectionExchangeTransformer',
      parameters: ['registration', 'informantsSignature']
    }
  }
} satisfies SerializedFormField
