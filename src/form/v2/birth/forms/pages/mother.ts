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

import {
  AddressType,
  and,
  ConditionalType,
  defineFormPage,
  FieldType,
  PageTypes,
  field,
  user
} from '@opencrvs/toolkit/events'
import { or, not, never } from '@opencrvs/toolkit/conditionals'
import { emptyMessage } from '@countryconfig/form/v2/utils'
import {
  invalidNameValidator,
  nationalIdValidator,
  MAX_NAME_LENGTH
} from '@countryconfig/form/v2/birth/validators'
import { InformantType } from './informant'
import { IdType, idTypeOptions } from '../../../person'
import {
  educationalAttainmentOptions,
  maritalStatusOptions
} from '../../../../common/select-options'
import {
  defaultStreetAddressConfiguration,
  getNestedFieldValidators
} from '@countryconfig/form/street-address-configuration'
import {
  ESIGNET_REDIRECT_URL,
  MOSIP_API_USERINFO_URL,
  OPENID_PROVIDER_CLIENT_ID
} from '@countryconfig/constants'

export const requireMotherDetails = or(
  field('mother.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.MOTHER)
)

export const mother = defineFormPage({
  id: 'mother',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Mother's details",
    description: 'Form section title for mothers details',
    id: 'form.section.mother.title'
  },
  fields: [
    {
      id: 'mother.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Mother's details are not available",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.MOTHER)
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('mother.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'mother.details.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.MOTHER)
          )
        }
      ]
    },
    {
      id: 'mother.reason',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.detailsNotAvailable').isEqualTo(true),
            not(field('informant.relation').isEqualTo(InformantType.MOTHER))
          )
        }
      ]
    },
    /*
     * @opencrvs/mosip: MOSIP / E-Signet
     */
    {
      id: 'mother.verified',
      type: FieldType.VERIFICATION_STATUS,
      label: {
        id: 'mother.verified.status',
        defaultMessage: 'Verification status',
        description: 'The title for the status field label'
      },
      configuration: {
        status: {
          id: 'mother.verified.status.text',
          defaultMessage:
            '{value, select, authenticated {ID Authenticated} verified {ID Verified} failed {Unverified ID} pending {Pending verification} other {Invalid value}}',
          description:
            'Status text shown on the pill on both form declaration and review page'
        },
        description: {
          id: 'mother.verified.status.description',
          defaultMessage:
            '{value, select, authenticated {This identity has been successfully authenticated with the Farajaland’s National ID System. To make edits, please remove the authentication first.} verified {This identity data has been successfully verified with the Farajaland’s National ID System. Please note that their identity has not been authenticated using the individuals biometrics. To make edits, please remove the verification first.} pending {Identity pending verification with Farajaland’s National ID system} failed {The identity data does match an entry in Farajaland’s National ID System} other {Invalid value}}',
          description: 'Description text of the status'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    /*
     * @opencrvs/mosip: MOSIP / E-Signet
     */
    {
      id: 'mother.query-params',
      type: FieldType.QUERY_PARAM_READER,
      label: {
        id: 'mother.query-params.label',
        defaultMessage: 'Query param reader',
        description:
          'This is the label for the query param reader field - usually this is hidden'
      },
      configuration: {}
    },
    /*
     * @opencrvs/mosip: MOSIP / E-Signet
     */
    {
      id: 'mother.verify-nid-http-fetch',
      type: FieldType.HTTP,
      label: {
        defaultMessage: 'Fetch applicant information',
        description: 'Fetch applicant information',
        id: 'applicant.http-fetch.label'
      },
      configuration: {
        trigger: field('mother.query-params'),
        url: MOSIP_API_USERINFO_URL,
        timeout: 5000,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          clientId: OPENID_PROVIDER_CLIENT_ID,
          redirectUri: '/' // noop
        },
        params: {
          code: field('mother.query-params').get('code'),
          state: field('mother.query-params').get('state')
        }
      }
    },
    /*
     * @opencrvs/mosip: MOSIP / E-Signet
     */
    {
      id: 'mother.fetch-loader',
      type: FieldType.LOADER,
      parent: field('mother.verify-nid-http-fetch'),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('mother.verify-nid-http-fetch').get('loading').isFalsy()
          )
        }
      ],
      label: {
        id: 'mother.fetch-loader.label',
        defaultMessage: "Fetching the person's data from E-Signet",
        description:
          'This is the label for the fetch individual information loader'
      },
      configuration: {
        text: {
          id: 'mother.fetch-loader.label',
          defaultMessage: "Fetching the person's data from E-Signet",
          description:
            'This is the label for the fetch individual information loader'
        }
      }
    },
    {
      id: 'mother.id-reader',
      type: FieldType.ID_READER,
      required: false,
      label: {
        defaultMessage: 'QR Code',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.qr.label'
      },
      conditionals: [],
      methods: [
        {
          type: FieldType.QR_READER,
          label: {
            id: 'event.birth.action.declare.form.section.mother.field.qr.label',
            defaultMessage: 'Scan QR code',
            description: 'This is the label for the field'
          },
          id: 'mother.id-reader'
        },
        {
          id: 'mother.verify',
          type: FieldType.LINK_BUTTON,
          label: {
            id: 'mother.verify',
            defaultMessage: 'Authenticate',
            description: 'The title for the E-Signet verification button'
          },
          configuration: {
            icon: 'Globe',
            url: `${ESIGNET_REDIRECT_URL}?client_id=${OPENID_PROVIDER_CLIENT_ID}&response_type=code&scope=openid%20profile&acr_values=mosip:idp:acr:static-code&claims=name,family_name,given_name,middle_name,birthdate,address&state=fetch-on-mount`,
            text: {
              id: 'mother.verify',
              defaultMessage: 'e-Signet',
              description: 'The title for the E-Signet verification button'
            }
          }
        }
      ]
    },
    {
      id: 'mother.name',
      parent: field('mother.id-reader'),
      type: FieldType.NAME,
      required: true,
      configuration: { maxLength: MAX_NAME_LENGTH },
      hideLabel: true,
      label: {
        defaultMessage: "Mother's name",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.name.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            field('mother.verify-nid-http-fetch').get('data.name').isFalsy()
          )
        }
      ],
      value: field('mother.id-reader').get('name'),
      validation: [invalidNameValidator('mother.name')]
    },
    {
      id: 'mother.name',
      parent: field('mother.verify-nid-http-fetch'),
      type: FieldType.NAME,
      required: true,
      configuration: { maxLength: MAX_NAME_LENGTH },
      hideLabel: true,
      label: {
        defaultMessage: "Mother's name",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.name.label'
      },
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: never()
        },
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            not(
              field('mother.verify-nid-http-fetch').get('data.name').isFalsy()
            )
          )
        }
      ],
      value: field('mother.verify-nid-http-fetch').get('data.name'),
      validation: [invalidNameValidator('mother.name')]
    },
    {
      id: 'mother.dob',
      type: 'DATE',
      parent: field('mother.id-reader'),
      value: field('mother.id-reader').get('birthDate'),
      required: true,
      secured: true,
      analytics: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid birth date',
            description: 'This is the error message for invalid date',
            id: 'event.birth.action.declare.form.section.person.field.dob.error'
          },
          validator: field('mother.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              "This is the error message for a birth date after child's birth date",
            id: 'event.birth.action.declare.form.section.person.dob.afterChild'
          },
          validator: field('mother.dob').isBefore().date(field('child.dob'))
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.dob.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('mother.dobUnknown').isEqualTo(true)),
            requireMotherDetails,
            field('mother.verify-nid-http-fetch')
              .get('data.birthDate')
              .isFalsy()
          )
        }
      ]
    },
    {
      id: 'mother.dob',
      type: 'DATE',
      parent: field('mother.verify-nid-http-fetch'),
      value: field('mother.verify-nid-http-fetch').get('data.birthDate'),
      required: true,
      secured: true,
      analytics: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid birth date',
            description: 'This is the error message for invalid date',
            id: 'event.birth.action.declare.form.section.person.field.dob.error'
          },
          validator: field('mother.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              "This is the error message for a birth date after child's birth date",
            id: 'event.birth.action.declare.form.section.person.dob.afterChild'
          },
          validator: field('mother.dob').isBefore().date(field('child.dob'))
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.dob.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('mother.dobUnknown').isEqualTo(true)),
            requireMotherDetails,
            not(
              field('mother.verify-nid-http-fetch')
                .get('data.birthDate')
                .isFalsy()
            )
          )
        },
        {
          type: ConditionalType.ENABLE,
          conditional: never()
        }
      ]
    },
    {
      id: 'mother.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.age.checkbox.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'mother.age',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Age of mother',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.age.label'
      },
      configuration: {
        postfix: {
          defaultMessage: 'years',
          description: 'This is the postfix for age field',
          id: 'event.birth.action.declare.form.section.person.field.age.postfix'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.dobUnknown').isEqualTo(true),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: 'mother.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      defaultValue: 'FAR'
    },
    {
      id: 'mother.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.idType.label'
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.nid',
      type: FieldType.ID,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.nid.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.idType').isEqualTo(IdType.NATIONAL_ID),
            requireMotherDetails
          )
        }
      ],
      validation: [
        nationalIdValidator('mother.nid'),
        {
          message: {
            defaultMessage: 'National id must be unique',
            description: 'This is the error message for non-unique ID Number',
            id: 'event.birth.action.declare.form.nid.unique'
          },
          validator: and(
            not(field('mother.nid').isEqualTo(field('father.nid'))),
            not(field('mother.nid').isEqualTo(field('informant.nid')))
          )
        }
      ]
    },
    {
      id: 'mother.passport',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.idType').isEqualTo(IdType.PASSPORT),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: 'mother.brn',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.brn.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.idType').isEqualTo(IdType.BIRTH_REGISTRATION_NUMBER),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: 'mother.addressDivider1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.addressHelper',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.addressHelper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.address',
      type: FieldType.ADDRESS,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('mother.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'mother.address',
          defaultStreetAddressConfiguration
        )
      ],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    {
      id: 'mother.addressDivider2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.maritalStatus',
      type: FieldType.SELECT,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Marital Status',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.maritalStatus.label'
      },
      options: maritalStatusOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.educationalAttainment',
      type: FieldType.SELECT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Level of education',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.educationalAttainment.label'
      },
      options: educationalAttainmentOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.occupation',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.occupation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.previousBirths',
      type: FieldType.NUMBER,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'No. of previous births',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.previousBirths.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      configuration: {
        min: 0
      }
    }
  ]
})
