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
import { uppercaseFirstLetter } from '@countryconfig/utils'
import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { camelCase } from 'lodash'
import { MessageDescriptor } from 'react-intl'
import {
  getNationalIDValidators,
  hideIfNotMarried,
  singleBirthType
} from './default-validation-conditionals'
import { formMessageDescriptors } from './messages'
import { Conditional, SerializedFormField, ISelectOption } from '../types/types'
import { getInitialValueFromIDReader } from '@opencrvs/mosip'
import { registrationEmail, registrationPhone } from './common-optional-fields'

export function getReasonForLateRegistration(
  event: string
): SerializedFormField {
  const fieldName: string = 'reasonForLateRegistration'
  const fieldId: string =
    event === 'birth'
      ? `birth.child.child-view-group.${fieldName}`
      : `death.deathEvent.death-event-details.${fieldName}`
  const label: MessageDescriptor =
    event === 'birth'
      ? {
          id: 'form.customField.label.reasonForLateRegistrationBirth',
          description:
            'A form field that asks the reason for a late registration.',
          defaultMessage: 'Reason for delayed registration'
        }
      : {
          id: 'form.customField.label.reasonForLateRegistrationDeath',
          description:
            'A form field that asks the reason for a late registration.',
          defaultMessage: 'Reason for late registration'
        }
  const expression: string =
    event === 'birth'
      ? 'const pattern = /^\\d{4}-\\d{1,2}-\\d{1,2}$/; const today = new Date(); const eventDatePlusLateRegistrationTarget = new Date(values.childBirthDate); const lateRegistrationTarget = offlineCountryConfig && offlineCountryConfig.config.BIRTH.LATE_REGISTRATION_TARGET; eventDatePlusLateRegistrationTarget.setDate(eventDatePlusLateRegistrationTarget.getDate() + lateRegistrationTarget); !pattern.test(values.childBirthDate) || today < eventDatePlusLateRegistrationTarget;'
      : 'const pattern = /^\\d{4}-\\d{1,2}-\\d{1,2}$/; const today = new Date(); const eventDatePlusLateRegistrationTarget = new Date(values.deathDate); const lateRegistrationTarget = offlineCountryConfig && offlineCountryConfig.config.DEATH.REGISTRATION_TARGET; eventDatePlusLateRegistrationTarget.setDate(eventDatePlusLateRegistrationTarget.getDate() + lateRegistrationTarget); !pattern.test(values.deathDate) || today < eventDatePlusLateRegistrationTarget;'

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TEXT',
    label,
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: [
      {
        action: 'hide',
        expression
      }
    ], // EDIT CONDITIONALS AS YOU SEE FIT
    maxLength: 250
  }
}

type ArrayElement<ArrayType> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never

const idTypeOptions = [
  {
    value: 'NATIONAL_ID' as const,
    label: {
      defaultMessage: 'National ID',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypeNationalID'
    }
  },
  {
    value: 'PASSPORT' as const,
    label: {
      defaultMessage: 'Passport',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypePassport'
    }
  },
  {
    value: 'BIRTH_REGISTRATION_NUMBER' as const,
    label: {
      defaultMessage: 'Birth Registration Number',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypeBRN'
    }
  },
  {
    value: 'NONE' as const,
    label: {
      defaultMessage: 'None',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypeNone'
    }
  }
]

type IDType = ArrayElement<typeof idTypeOptions>['value']

export function getRace(
  sectionId: string,
  conditionals: Conditional[] = []
): SerializedFormField {
  const fieldName: string = `${sectionId}Race`
  const fieldId: string = `birth.${sectionId}.${sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TEXT',
    label: {
      id: 'form.field.label.race',
      description: 'A form field that asks for the Race',
      defaultMessage: 'Race'
    },
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals, // EDIT CONDITIONALS AS YOU SEE FIT
    maxLength: 250
  }
}

export function getIDType(
  event: string,
  sectionId: string,
  conditionals: Conditional[] = [],
  required: boolean
): SerializedFormField {
  const fieldName: string = `${sectionId}IdType`
  const fieldId: string = `${event}.${sectionId}.${sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required,
    type: 'SELECT_WITH_OPTIONS',
    label: {
      id: 'form.field.label.iDType',
      description: 'A form field that asks for the type of ID.',
      defaultMessage: 'Type of ID'
    },
    initialValue: {
      dependsOn: ['idReader', 'verified'],
      expression:
        '!!$form?.idReader?.nid || $form?.verified === "verified" || $form?.verified === "authenticated" ? "NATIONAL_ID" : ""'
    },
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    conditionals,
    options: idTypeOptions
  }
}

function getValidators(configCase: string, idValue: IDType) {
  if (idValue === 'NATIONAL_ID') {
    return getNationalIDValidators(configCase)
  }
  return []
}

function initialValuesForIDType(idType: IDType) {
  if (idType === 'NATIONAL_ID') {
    return getInitialValueFromIDReader('nid')
  } else {
    return ''
  }
}

export function getIDNumber(
  sectionId: string,
  idValue: IDType,
  conditionals: Conditional[] = [],
  required: boolean,
  other?: string
): SerializedFormField {
  const fieldName: string = `${other ? other : sectionId}${uppercaseFirstLetter(
    camelCase(idValue)
  )}`
  const validators = getValidators(other ? other : sectionId, idValue)

  return {
    name: fieldName,
    required,
    type: 'TEXT',
    custom: true,
    label: {
      id: 'form.field.label.iD',
      description: 'A form field that asks for the Sinhala first name',
      defaultMessage: 'ID number'
    },
    initialValue: initialValuesForIDType(idValue),
    validator: validators,
    mapping: {
      template: {
        fieldName: fieldName,
        operation: 'identityToFieldTransformer',
        parameters: ['id', idValue]
      },
      mutation: {
        operation: 'fieldToIdentityTransformer',
        parameters: ['id', idValue]
      },
      query: {
        operation: 'identityToFieldTransformer',
        parameters: ['id', idValue]
      }
    },
    conditionals: [
      {
        action: 'hide',
        expression: `(values.${sectionId}IdType!=="${idValue}") || (values.${sectionId}IdType==="NONE")`
      }
    ].concat(conditionals),
    maxLength: 250
  }
}

export function getIDNumberFields(
  section: string,
  conditionals: Conditional[] = [],
  required: boolean
) {
  return idTypeOptions
    .filter((opt) => opt.value !== 'NONE')
    .map((opt) => getIDNumber(section, opt.value, conditionals, required))
}

export function getFirstNameInSinhalaField(
  sectionId: string,
  conditionals: Conditional[] = [],
  previewGroup: string,
  required: boolean,
  other?: string
): SerializedFormField {
  const fieldName: string = `${other ? other : sectionId}SinhalaFirstName`
  const fieldId: string = `birth.${sectionId}.${other ? other : sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required,
    type: 'TEXT',
    label: {
      id: 'form.field.label.sinhalaFirstName',
      description: 'A form field that asks for the Sinhala first name',
      defaultMessage: 'First name in Sinhala'
    },
    initialValue: '',
    validator: [],
    previewGroup,
    mapping: getCustomFieldMapping(fieldId),
    conditionals, // EDIT CONDITIONALS AS YOU SEE FIT
    maxLength: 250
  }
}
export function getFirstNameInTamilField(
  sectionId: string,
  conditionals: Conditional[] = [],
  previewGroup: string,
  required: boolean,
  other?: string
): SerializedFormField {
  const fieldName: string = `${other ? other : sectionId}TamilFirstName`
  const fieldId: string = `birth.${sectionId}.${other ? other : sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required,
    type: 'TEXT',
    label: {
      id: 'form.field.label.tamilFirstName',
      description: 'A form field that asks for the Tamil first name',
      defaultMessage: 'First name in Tamil'
    },
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    previewGroup,
    conditionals, // EDIT CONDITIONALS AS YOU SEE FIT
    maxLength: 250
  }
}
export function getFamilyNameInSinhalaField(
  sectionId: string,
  conditionals: Conditional[] = [],
  previewGroup: string,
  required: boolean,
  other?: string
): SerializedFormField {
  const fieldName: string = `${other ? other : sectionId}SinhalaFamilyName`
  const fieldId: string = `birth.${sectionId}.${other ? other : sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    previewGroup,
    custom: true,
    required,
    type: 'TEXT',
    label: {
      id: 'form.field.label.sinhalaLastName',
      description: 'A form field that asks for the Sinhala last name',
      defaultMessage: 'Last name in Sinhala'
    },
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals, // EDIT CONDITIONALS AS YOU SEE FIT
    maxLength: 250
  }
}
export function getFamilyNameInTamilField(
  sectionId: string,
  conditionals: Conditional[] = [],
  previewGroup: string,
  required: boolean,
  other?: string
): SerializedFormField {
  const fieldName: string = `${other ? other : sectionId}TamilFamilyName`
  const fieldId: string = `birth.${sectionId}.${other ? other : sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required,
    previewGroup,
    type: 'TEXT',
    label: {
      id: 'form.field.label.tamilLastName',
      description: 'A form field that asks for the Tamil first name',
      defaultMessage: 'Last name in Tamil'
    },
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals, // EDIT CONDITIONALS AS YOU SEE FIT
    maxLength: 250
  }
}

export function getAgeAtDateOfBirthOfChild(
  conditionals: Conditional[]
): SerializedFormField {
  const fieldName: string = `ageAtBirthOfChild`
  const fieldId: string = `birth.mother.mother-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'NUMBER',
    label: formMessageDescriptors.ageAtBirthOfChild,
    initialValue: '',
    validator: [
      {
        operation: 'range',
        parameters: [1, 70]
      },
      {
        operation: 'nonDecimalPointNumber'
      }
    ],
    mapping: getCustomFieldMapping(fieldId),
    conditionals
  }
}

export function getBirthOrder(): SerializedFormField {
  const fieldName: string = `birthOrder`
  const fieldId: string = `birth.child.child-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'NUMBER',
    label: formMessageDescriptors.childBirthOrder,
    initialValue: '',
    validator: [
      {
        operation: 'range',
        parameters: [1, 30]
      },
      {
        operation: 'nonDecimalPointNumber'
      }
    ],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: []
  }
}
export function getNumberOfChildren(): SerializedFormField {
  const fieldName: string = `numberOfChildren`
  const fieldId: string = `birth.child.child-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'NUMBER',
    label: formMessageDescriptors.numberOfChildren,
    initialValue: '',
    validator: [
      {
        operation: 'range',
        parameters: [1, 15]
      },
      {
        operation: 'nonDecimalPointNumber'
      }
    ],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: [
      {
        action: 'hide',
        expression: singleBirthType
      }
    ]
  }
}

export function registrationLandLine(
  sectionId: string,
  conditionals: Conditional[]
): SerializedFormField {
  const fieldName: string = `${sectionId}LandLine`
  const fieldId: string = `birth.${sectionId}.${sectionId}-view-group.${fieldName}`
  return {
    name: fieldName,
    type: 'TEL',
    label: formMessageDescriptors.registrationLandLine,
    required: false,
    initialValue: '',
    validator: [
      {
        operation: 'isLandline'
      }
    ],
    conditionals,
    customQuestionMappingId: fieldId,
    custom: true,
    mapping: getCustomFieldMapping(fieldId)
  }
}

export function getSpacingParagraph(
  name: string,
  conditionals: Conditional[] = []
): SerializedFormField {
  return {
    custom: true,
    name,
    type: 'PARAGRAPH',
    label: formMessageDescriptors.empty,
    initialValue: '',
    validator: [],
    conditionals
  }
}

export function getContactDetails(
  sectionId: string,
  conditionals: Conditional[] = []
): SerializedFormField[] {
  return [
    {
      name: 'headingContactDetails',
      type: 'HEADING3',
      label: {
        defaultMessage: 'Contact Details',
        description: 'Contact Details',
        id: 'form.field.label.contactDetails'
      },
      initialValue: '',
      validator: [],
      conditionals
    },
    registrationPhone(sectionId, conditionals),
    registrationLandLine(sectionId, conditionals),
    registrationEmail(sectionId, conditionals)
  ]
}

export function getHospitalAdmissionDetails(
  conditionals: Conditional[]
): SerializedFormField[] {
  const fieldName: string = `admissionNumber`
  const fieldId: string = `birth.mother.mother-view-group.${fieldName}`
  const fieldName2: string = `dateOfAdmission`
  const fieldId2: string = `birth.mother.mother-view-group.${fieldName2}`
  return [
    {
      name: 'headingHospitalAdmission',
      type: 'HEADING3',
      label: {
        defaultMessage: 'Hospital Admission Information (if available)',
        description: 'Hospital Admission Information (if available)',
        id: 'form.field.label.hospitalAdmissionInformation'
      },
      initialValue: '',
      conditionals,
      validator: []
    },
    {
      name: fieldName,
      customQuestionMappingId: fieldId,
      custom: true,
      required: false,
      type: 'TEXT',
      label: {
        id: 'form.field.label.admissionNumber',
        description: 'A form field that asks for the admissionNumber',
        defaultMessage: 'Hospital Admission Number'
      },
      initialValue: '',
      validator: [],
      mapping: getCustomFieldMapping(fieldId),
      conditionals, // EDIT CONDITIONALS AS YOU SEE FIT
      maxLength: 250
    },
    {
      label: {
        id: 'form.field.label.dateOfAdmission',
        description: 'A form field that asks for the date of admission',
        defaultMessage: 'Date of Admission'
      },
      name: fieldName2,
      custom: true,
      required: false,
      type: 'DATE',
      initialValue: '',
      validator: [],
      customQuestionMappingId: fieldId2,
      mapping: getCustomFieldMapping(fieldId2),
      conditionals
    }
  ]
}

export function placeOfEventInividual(
  sectionId: string,
  conditionals: Conditional[] = [],
  previewGroup: string,
  eventSentenceCase: string,
  other?: string
): SerializedFormField[] {
  const fieldNameCountry: string = `${other ? other : sectionId}PlaceOf${eventSentenceCase}Country`
  const fieldIdCountry: string = `birth.${sectionId}.${sectionId}-view-group.${fieldNameCountry}`
  const fieldNameTown: string = `${other ? other : sectionId}PlaceOf${eventSentenceCase}Town`
  const fieldIdTown: string = `birth.${sectionId}.${sectionId}-view-group.${fieldNameTown}`
  const fieldNameHeading: string = `${other ? other : sectionId}PlaceOf${eventSentenceCase}Heading`
  return [
    eventSentenceCase === 'Birth'
      ? {
          name: fieldNameHeading,
          type: 'HEADING3',
          label: {
            defaultMessage: 'Place of Birth',
            description: 'Place of Birth',
            id: 'recordAudit.placeOfBirth'
          },
          previewGroup: previewGroup,
          initialValue: '',
          conditionals,
          validator: []
        }
      : {
          name: 'headingPlaceOfMarriage',
          type: 'HEADING3',
          label: {
            defaultMessage: 'Place of Marriage',
            description: 'Place of Marriage',
            id: 'form.field.label.placeOfMarriage'
          },
          previewGroup: previewGroup,
          initialValue: '',
          conditionals,
          validator: []
        },
    {
      name: fieldNameCountry,
      customQuestionMappingId: fieldIdCountry,
      custom: true,
      required: true,
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      validator: [],
      mapping: getCustomFieldMapping(fieldIdCountry),
      placeholder: formMessageDescriptors.formSelectPlaceholder,
      previewGroup: previewGroup,
      conditionals,
      initialValue: 'LKA',
      options: {
        resource: 'countries'
      }
    },
    {
      name: fieldNameTown,
      customQuestionMappingId: fieldIdTown,
      custom: true,
      required: true,
      type: 'TEXT',
      label: formMessageDescriptors.placeOfBirthIndividualTown,
      previewGroup: previewGroup,
      initialValue: '',
      validator: [],
      mapping: getCustomFieldMapping(fieldIdTown),
      conditionals
    }
  ]
}

const birthMarriageStatus: ISelectOption[] = [
  {
    value: 'MARRIED',
    label: {
      defaultMessage: 'Yes',
      id: 'form.field.label.confirm',
      description: 'Marital Status option: Married'
    }
  },
  {
    value: 'NOT_MARRIED',
    label: {
      defaultMessage: 'No',
      id: 'form.field.label.deny',
      description: 'Marital Status option: Not Married'
    }
  }
]

export function getMarried(): SerializedFormField {
  const fieldName = `married`
  const fieldId = `birth.marriage.marriage-view-group.${fieldName}`
  return {
    name: fieldName,
    custom: true,
    required: true,
    type: 'RADIO_GROUP',
    label: {
      defaultMessage: 'Were parents married?',
      id: 'form.field.label.wereParentsMarried',
      description: 'Were parents married?'
    },
    initialValue: '',
    validator: [],
    customQuestionMappingId: fieldId,
    mapping: getCustomFieldMapping(fieldId),
    conditionals: [],
    options: birthMarriageStatus
  }
}

export function getDateMarried(): SerializedFormField {
  const fieldName = `dateMarried`
  const fieldId = `birth.marriage.marriage-view-group.${fieldName}`
  return {
    name: fieldName,
    custom: true,
    required: false,
    type: 'DATE',
    label: formMessageDescriptors.marriageEventDate,
    initialValue: '',
    validator: [],
    customQuestionMappingId: fieldId,
    mapping: getCustomFieldMapping(fieldId),
    conditionals: [
      {
        action: 'hide',
        expression: hideIfNotMarried
      }
    ]
  }
}

export function getBornInSriLanka(
  sectionId: string,
  other?: string
): SerializedFormField {
  const fieldName: string = `${other ? other : sectionId}BornSriLanka`
  const fieldId: string = `birth.grandfather.grandfather-view-group.${fieldName}`
  return {
    name: fieldName,
    custom: true,
    required: false,
    type: 'RADIO_GROUP',
    label: other
      ? {
          defaultMessage:
            'If the Grandfather was not born in Sri Lanka, was the Great Grandfather of the child born in Sri Lanka?',
          id: 'form.field.label.greatGrandFatherBornInSriLanka',
          description: 'Great Grandfather born in Sri Lanka?'
        }
      : {
          defaultMessage: 'Was the Grandfather of the child born in Sri Lanka?',
          id: 'form.field.label.grandFatherBornInSriLanka',
          description: 'Grandfather born in Sri Lanka?'
        },
    initialValue: '',
    validator: [],
    customQuestionMappingId: fieldId,
    mapping: getCustomFieldMapping(fieldId),
    conditionals: [],
    options: birthMarriageStatus
  }
}

export function getYearOfBirth(
  sectionId: string,
  other?: string
): SerializedFormField {
  const fieldName: string = `${other ? other : sectionId}YearOfBirth`
  const fieldId: string = `birth.grandfather.grandfather-view-group.${fieldName}`
  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'NUMBER',
    label: {
      defaultMessage: 'Year of Birth',
      id: 'form.field.label.yearOfBirth',
      description: 'YearOfBirth'
    },
    initialValue: '',
    validator: [
      {
        operation: 'range',
        parameters: [1800, 2050]
      }
    ],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: []
  }
}
