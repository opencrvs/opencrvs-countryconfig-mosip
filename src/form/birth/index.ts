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

import { Event, ISerializedForm } from '../types/types'
import { formMessageDescriptors } from '../common/messages'
import { informantType } from './required-fields'
import {
  getBirthDate,
  getGender,
  getFamilyNameField,
  getFirstNameField,
  getNationality,
  otherInformantType,
  getDetailsExist,
  getReasonNotExisting
} from '../common/common-required-fields'
import { divider } from '../common/common-optional-fields'
import { birthType, weightAtBirth } from './optional-fields'
import {
  childNameInEnglish,
  fatherNameInEnglish,
  informantNameInEnglish,
  motherNameInEnglish,
  childNameInSinhala,
  childNameInTamil,
  motherNameInSinhala,
  motherNameInTamil,
  fatherNameInSinhala,
  fatherNameInTamil,
  informantNameInSinhala,
  informantNameInTamil,
  grandfatherNameInEnglish,
  grandfatherNameInSinhala,
  grandfatherNameInTamil,
  fatherPlaceOfBirth,
  motherPlaceOfBirth,
  greatGrandfatherNameInSinhala,
  greatGrandfatherNameInTamil,
  grandfatherPlaceOfBirth,
  greatGrandfatherPlaceOfBirth
} from '../common/preview-groups'
import {
  isValidChildBirthDate,
  hideIfInformantMotherOrFather,
  mothersDetailsExistConditionals,
  parentsBirthDateValidators,
  detailsExist,
  motherFirstNameConditionals,
  motherFamilyNameConditionals,
  fathersDetailsExistConditionals,
  fathersBirthDateConditionals,
  fatherFirstNameConditionals,
  fatherFamilyNameConditionals,
  mothersBirthDateConditionals,
  informantNotMotherOrFather,
  disableIfVerifiedOrAuthenticated,
  typeOfIDVerificationConditionals,
  hideIfTamil,
  hideIfSinhala,
  hideIfNotMarried
} from '../common/default-validation-conditionals'
import {
  informantFirstNameConditionals,
  informantFamilyNameConditionals
} from '../common/default-validation-conditionals'
import {
  documentsSection,
  registrationSection,
  previewSection,
  reviewSection
} from './required-sections'
import { certificateHandlebars } from './certificate-handlebars'
import { getSectionMapping } from '@countryconfig/utils/mapping/section/birth/mapping-utils'
import {
  getCommonSectionMapping,
  getCustomFieldMapping
} from '@countryconfig/utils/mapping/field-mapping-utils'
import { idReaderFields, getInitialValueFromIDReader } from '@opencrvs/mosip'
import { esignetConfig, qrCodeConfig } from '../common/id-reader-configurations'
import {
  getBirthOrder,
  getIDType,
  getIDNumberFields,
  getFirstNameInSinhalaField,
  getFirstNameInTamilField,
  getFamilyNameInSinhalaField,
  getFamilyNameInTamilField,
  getNumberOfChildren,
  getMarried,
  placeOfEventInividual,
  getIDNumber,
  getRace,
  getAgeAtDateOfBirthOfChild,
  getContactDetails,
  getHospitalAdmissionDetails,
  getDateMarried,
  getBornInSriLanka,
  getYearOfBirth,
  getSpacingParagraph
} from '../common/common-custom-fields'

// import { createCustomFieldExample } from '../custom-fields'

// ======================= FORM CONFIGURATION =======================

// A REGISTRATION FORM IS MADE UP OF PAGES OR "SECTIONS"

// A "SECTION" CAN BE SPLIT OVER MULTIPLE SUB-PAGES USING "GROUPS"

// GROUPS CONTAIN A FIELDS ARRAY AND EACH FIELD IS RENDERED BY A FORM FIELD FUNCTION

// MOVE FORM FIELD FUNCTIONS UP AND DOWN TO CHANGE THE VERTICAL ORDER OF FIELDS

// IN EACH GROUP, REQUIRED FIELDS MUST BE INCLUDED AS-IS FOR OPENCRVS TO FUNCTION

// OPTIONAL FIELDS CAN BE COMMENTED OUT OR REMOVED IF NOT REQUIRED

// DUPLICATE & FOLLOW THE INSTRUCTIONS IN THE createCustomFieldExample FUNCTION WHEN REQUIRED FOR ADDING NEW CUSTOM FIELDS

export const birthForm: ISerializedForm = {
  sections: [
    registrationSection, // REQUIRED HIDDEN SECTION CONTAINING IDENTIFIERS
    {
      id: 'information',
      viewType: 'form',
      name: {
        defaultMessage: 'Information',
        description: 'Form section name for Information',
        id: 'form.section.information.name'
      },
      groups: [
        {
          id: 'information-group',
          title: {
            defaultMessage:
              'Introduce the birth registration process to the informant',
            description: 'Event information title for the birth',
            id: 'register.eventInfo.birth.title'
          },
          conditionals: [
            {
              action: 'hide',
              expression: 'window.config.HIDE_BIRTH_EVENT_REGISTER_INFORMATION'
            }
          ],
          fields: [
            {
              name: 'list',
              type: 'BULLET_LIST',
              items: [
                {
                  defaultMessage:
                    'I am going to help you make a declaration of birth.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet1'
                },
                {
                  defaultMessage:
                    'As the legal Informant it is important that all the information provided by you is accurate.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet2'
                },
                {
                  defaultMessage:
                    'Once the declaration is processed you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet3'
                },
                {
                  defaultMessage:
                    'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet4'
                }
              ],
              // this is to set the title of the page
              label: {
                id: 'register.eventInfo.birth.title'
              },
              initialValue: '',
              validator: []
            }
          ]
        }
      ]
    },
    {
      id: 'child',
      viewType: 'form',
      name: formMessageDescriptors.childTab,
      title: formMessageDescriptors.childTitle,
      mapping: getSectionMapping('child'), // These mappings support configurable identifiers in the event-registration API
      groups: [
        {
          id: 'child-view-group',
          fields: [
            getBirthDate(
              'childBirthDate',
              [],
              isValidChildBirthDate,
              certificateHandlebars.eventDate
            ), // Required field.
            // PLACE OF BIRTH FIELDS WILL RENDER HERE
            divider('child-address-seperator', []),
            getFirstNameField(
              'childNameInEnglish',
              [],
              certificateHandlebars.childFirstName
            ), // Required field.  Names in Latin characters must be provided for international passport
            getFamilyNameField(
              'childNameInEnglish',
              [],
              certificateHandlebars.childFamilyName
            ), // Required field.  Names in Latin characters must be provided for international passport
            getFirstNameInSinhalaField(
              'child',
              [hideIfTamil],
              'childNameInSinhala',
              true
            ),
            getFamilyNameInSinhalaField(
              'child',
              [hideIfTamil],
              'childNameInSinhala',
              true
            ),
            getFirstNameInTamilField(
              'child',
              [hideIfSinhala],
              'childNameInTamil',
              true
            ),
            getFamilyNameInTamilField(
              'child',
              [hideIfSinhala],
              'childNameInTamil',
              true
            ),
            divider('child-sex-seperator', []),
            getGender(certificateHandlebars.childGender), // Required field.
            weightAtBirth,
            getBirthOrder(),
            birthType,
            getNumberOfChildren()
          ],
          previewGroups: [
            childNameInEnglish,
            childNameInSinhala,
            childNameInTamil
          ] // Preview groups are used to structure data nicely in Review Page UI
        }
      ]
    },
    {
      id: 'informant',
      viewType: 'form',
      name: {
        defaultMessage: 'Informant',
        description: 'Form section name for Informant',
        id: 'form.section.informant.name'
      },
      title: formMessageDescriptors.birthInformantTitle,
      groups: [
        {
          id: 'informant-view-group',
          fields: [
            informantType, // Required field.
            otherInformantType(Event.Birth), // Required field.
            getNationality(
              certificateHandlebars.informantNationality,
              hideIfInformantMotherOrFather.concat(
                disableIfVerifiedOrAuthenticated
              )
            ), // Required field.
            ...idReaderFields(
              'birth',
              'informant',
              qrCodeConfig,
              esignetConfig,
              getCustomFieldMapping(
                `birth.informant.informant-view-group.verified`
              ),
              informantFirstNameConditionals.concat(
                hideIfInformantMotherOrFather
              )
            ),
            getIDType(
              'birth',
              'informant',
              hideIfInformantMotherOrFather.concat(
                typeOfIDVerificationConditionals
              ),
              true
            ),
            ...getIDNumberFields(
              'informant',
              hideIfInformantMotherOrFather.concat(
                typeOfIDVerificationConditionals
              ),
              true
            ),
            getFirstNameField(
              'informantNameInEnglish',
              informantFirstNameConditionals.concat(
                hideIfInformantMotherOrFather,
                disableIfVerifiedOrAuthenticated
              ),
              certificateHandlebars.informantFirstName,
              getInitialValueFromIDReader('firstName')
            ), // Required field. In Farajaland, we have built the option to integrate with MOSIP. So we have different conditionals for each name to check MOSIP responses.  You could always refactor firstNamesEng for a basic setup
            getFamilyNameField(
              'informantNameInEnglish',
              informantFamilyNameConditionals.concat(
                hideIfInformantMotherOrFather,
                disableIfVerifiedOrAuthenticated
              ),
              certificateHandlebars.informantFamilyName,
              getInitialValueFromIDReader('familyName')
            ), // Required field.
            getFirstNameInSinhalaField(
              'informant',
              informantFamilyNameConditionals.concat(
                hideIfInformantMotherOrFather,
                hideIfTamil
              ),
              'informantNameInSinhala',
              true
            ),
            getFamilyNameInSinhalaField(
              'informant',
              informantFamilyNameConditionals.concat(
                hideIfInformantMotherOrFather,
                hideIfTamil
              ),
              'informantNameInSinhala',
              true
            ),
            getFirstNameInTamilField(
              'informant',
              informantFamilyNameConditionals.concat(
                hideIfInformantMotherOrFather,
                hideIfSinhala
              ),
              'informantNameInTamil',
              true
            ),
            getFamilyNameInTamilField(
              'informant',
              informantFamilyNameConditionals.concat(
                hideIfInformantMotherOrFather,
                hideIfSinhala
              ),
              'informantNameInTamil',
              true
            ),
            // ADDRESS FIELDS WILL RENDER HERE
            getSpacingParagraph('informant-address-seperator'),
            ...getContactDetails('informant')
          ],
          previewGroups: [
            informantNameInEnglish,
            informantNameInSinhala,
            informantNameInTamil
          ]
        }
      ],
      mapping: getCommonSectionMapping('informant')
    },
    {
      id: 'father',
      viewType: 'form',
      name: {
        defaultMessage: 'Father',
        description: 'Form section name for Father',
        id: 'form.section.father.name'
      },
      title: {
        defaultMessage: "Father's details",
        description: 'Form section title for Father',
        id: 'form.section.father.title'
      },
      groups: [
        {
          id: 'father-view-group',
          fields: [
            getDetailsExist(
              formMessageDescriptors.fathersDetailsExist,
              fathersDetailsExistConditionals
            ), // Strongly recommend is required if you want to register abandoned / orphaned children!
            divider(
              'father-details-seperator',
              fathersDetailsExistConditionals
            ),
            getReasonNotExisting('fatherReasonNotApplying'), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getNationality(
              certificateHandlebars.fatherNationality,
              detailsExist.concat(disableIfVerifiedOrAuthenticated)
            ), // Required field.
            ...idReaderFields(
              'birth',
              'father',
              qrCodeConfig,
              esignetConfig,
              getCustomFieldMapping(`birth.father.father-view-group.verified`),
              detailsExist
            ),
            getIDType(
              'birth',
              'father',
              detailsExist.concat(typeOfIDVerificationConditionals),
              true
            ),
            ...getIDNumberFields(
              'father',
              detailsExist.concat(typeOfIDVerificationConditionals),
              true
            ),
            getFirstNameField(
              'fatherNameInEnglish',
              fatherFirstNameConditionals.concat(
                disableIfVerifiedOrAuthenticated
              ),
              certificateHandlebars.fatherFirstName,
              getInitialValueFromIDReader('firstName')
            ), // Required field.
            getFamilyNameField(
              'fatherNameInEnglish',
              fatherFamilyNameConditionals.concat(
                disableIfVerifiedOrAuthenticated
              ),
              certificateHandlebars.fatherFamilyName,
              getInitialValueFromIDReader('familyName')
            ), // Required field.
            getFirstNameInSinhalaField(
              'father',
              detailsExist.concat(hideIfTamil),
              'fatherNameInSinhala',
              true
            ),
            getFamilyNameInSinhalaField(
              'father',
              detailsExist.concat(hideIfTamil),
              'fatherNameInSinhala',
              true
            ),
            getFirstNameInTamilField(
              'father',
              detailsExist.concat(hideIfSinhala),
              'fatherNameInTamil',
              true
            ),
            getFamilyNameInTamilField(
              'father',
              detailsExist.concat(hideIfSinhala),
              'fatherNameInTamil',
              true
            ),

            divider('father-birthdate-seperator', detailsExist),
            getBirthDate(
              'fatherBirthDate',
              fathersBirthDateConditionals.concat(
                disableIfVerifiedOrAuthenticated
              ),
              parentsBirthDateValidators,
              certificateHandlebars.fatherBirthDate,
              getInitialValueFromIDReader('birthDate')
            ), // Required field.
            ...placeOfEventInividual(
              'father',
              detailsExist,
              'fatherPlaceOfBirth',
              'Birth'
            ),
            divider('father-race-seperator', detailsExist),
            getRace('father', detailsExist),
            // ADDRESS FIELDS WILL RENDER HERE
            divider('father-address-seperator', [
              {
                action: 'hide',
                expression: informantNotMotherOrFather
              }
            ])
          ],
          previewGroups: [
            fatherNameInEnglish,
            fatherNameInSinhala,
            fatherNameInTamil,
            fatherPlaceOfBirth
          ]
        }
      ],
      mapping: getSectionMapping('father')
    },
    {
      id: 'mother',
      viewType: 'form',
      name: formMessageDescriptors.motherName,
      title: formMessageDescriptors.motherTitle,
      groups: [
        {
          id: 'mother-view-group',
          fields: [
            getDetailsExist(
              formMessageDescriptors.mothersDetailsExist,
              mothersDetailsExistConditionals
            ), // Strongly recommend is required if you want to register abandoned / orphaned children!
            divider(
              'mother-details-seperator',
              mothersDetailsExistConditionals
            ),
            getReasonNotExisting(certificateHandlebars.motherReasonNotApplying), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getNationality(
              certificateHandlebars.motherNationality,
              detailsExist.concat(disableIfVerifiedOrAuthenticated)
            ), // Required field.
            ...idReaderFields(
              'birth',
              'mother',
              qrCodeConfig,
              esignetConfig,
              getCustomFieldMapping(`birth.mother.mother-view-group.verified`),
              detailsExist
            ),
            getIDType(
              'birth',
              'mother',
              detailsExist.concat(typeOfIDVerificationConditionals),
              true
            ),
            ...getIDNumberFields(
              'mother',
              detailsExist.concat(typeOfIDVerificationConditionals),
              true
            ),
            getFirstNameField(
              'motherNameInEnglish',
              motherFirstNameConditionals.concat(
                disableIfVerifiedOrAuthenticated
              ),
              certificateHandlebars.motherFirstName,
              getInitialValueFromIDReader('firstName')
            ), // Required field.
            getFamilyNameField(
              'motherNameInEnglish',
              motherFamilyNameConditionals.concat(
                disableIfVerifiedOrAuthenticated
              ),
              certificateHandlebars.motherFamilyName,
              getInitialValueFromIDReader('familyName')
            ), // Required field.
            getFirstNameInSinhalaField(
              'mother',
              detailsExist.concat(hideIfTamil),
              'motherNameInSinhala',
              true
            ),
            getFamilyNameInSinhalaField(
              'mother',
              detailsExist.concat(hideIfTamil),
              'motherNameInSinhala',
              true
            ),
            getFirstNameInTamilField(
              'mother',
              detailsExist.concat(hideIfSinhala),
              'motherNameInTamil',
              true
            ),
            getFamilyNameInTamilField(
              'mother',
              detailsExist.concat(hideIfSinhala),
              'motherNameInTamil',
              true
            ),

            divider('mother-birthdate-seperator', detailsExist),
            getBirthDate(
              'motherBirthDate',
              mothersBirthDateConditionals.concat(
                disableIfVerifiedOrAuthenticated
              ),
              parentsBirthDateValidators,
              certificateHandlebars.motherBirthDate,
              getInitialValueFromIDReader('birthDate')
            ), // Required field.
            getAgeAtDateOfBirthOfChild(detailsExist),
            ...placeOfEventInividual(
              'mother',
              detailsExist,
              'motherPlaceOfBirth',
              'Birth'
            ),
            divider('mother-race-seperator', detailsExist),
            getRace('mother', detailsExist),
            // ADDRESS FIELDS WILL RENDER HERE
            ...getContactDetails('mother', detailsExist),
            ...getHospitalAdmissionDetails(detailsExist)
          ],
          previewGroups: [
            motherNameInEnglish,
            motherNameInSinhala,
            motherNameInTamil,
            motherPlaceOfBirth
          ]
        }
      ],
      mapping: getSectionMapping('mother')
    },
    {
      id: 'marriage',
      viewType: 'form',
      name: {
        defaultMessage: 'Details of the Marriage',
        description: 'Form section name for Marriage Details',
        id: 'form.section.marriageEvent.name'
      },
      title: {
        defaultMessage: 'Details of the Marriage',
        description: 'Form section title for Marriage Details',
        id: 'form.section.marriageEvent.name'
      },
      groups: [
        {
          id: 'marriage-view-group',
          fields: [
            getMarried(),
            ...placeOfEventInividual(
              'marriage',
              [
                {
                  action: 'hide',
                  expression: hideIfNotMarried
                }
              ],
              'placeOfMarrriage',
              'Marrriage'
            ),
            getDateMarried()
          ]
        }
      ]
    },
    {
      id: 'grandfather',
      viewType: 'form',
      name: {
        defaultMessage: 'Details of the Grandfather / Great Grandfather',
        description: 'Form section name for grandFather',
        id: 'form.section.grandfather.name'
      },
      title: {
        defaultMessage: 'Details of the Grandfather / Great Grandfather',
        description: 'Form section name for grandFather',
        id: 'form.section.grandfather.name'
      },
      groups: [
        {
          id: 'grandfather-view-group',
          fields: [
            getBornInSriLanka('grandfather'),
            {
              name: 'headingGrandfather',
              type: 'HEADING3',
              label: {
                defaultMessage: 'Grandfather',
                description: '',
                id: 'form.field.label.app.whoContDet.grandFather'
              },
              initialValue: '',
              conditionals: [],
              validator: []
            },
            getFirstNameInSinhalaField(
              'grandfather',
              [hideIfTamil],
              'grandfatherNameInSinhala',
              false
            ),
            getFamilyNameInSinhalaField(
              'grandfather',
              [hideIfTamil],
              'grandfatherNameInSinhala',
              false
            ),
            getFirstNameInTamilField(
              'grandfather',
              [hideIfSinhala],
              'grandfatherNameInTamil',
              false
            ),
            getFamilyNameInTamilField(
              'grandfather',
              [hideIfSinhala],
              'grandfatherNameInTamil',
              false
            ),
            getIDNumber('grandfather', 'NATIONAL_ID', [], false),
            getYearOfBirth('grandfather'),
            ...placeOfEventInividual(
              'grandfather',
              detailsExist,
              'grandfatherPlaceOfBirth',
              'Birth'
            ),
            divider('greatGrandfather-seperator', []),
            getBornInSriLanka('grandfather', 'greatGrandfather'),
            {
              name: 'headingGreatGrandfather',
              type: 'HEADING3',
              label: {
                defaultMessage: 'Great Grandfather',
                description: '',
                id: 'form.field.label.app.whoContDet.greatGrandFather'
              },
              initialValue: '',
              conditionals: [],
              validator: []
            },
            getFirstNameInSinhalaField(
              'grandfather',
              [hideIfTamil],
              'greatGrandfatherNameInSinhala',
              false,
              'greatGrandfather'
            ),
            getFamilyNameInSinhalaField(
              'grandfather',
              [hideIfTamil],
              'greatGrandfatherNameInSinhala',
              false,
              'greatGrandfather'
            ),
            getFirstNameInTamilField(
              'grandfather',
              [hideIfSinhala],
              'greatGrandfatherNameInTamil',
              false,
              'greatGrandfather'
            ),
            getFamilyNameInTamilField(
              'grandfather',
              [hideIfSinhala],
              'greatGrandfatherNameInTamil',
              false,
              'greatGrandfather'
            ),
            getIDNumber(
              'grandfather',
              'NATIONAL_ID',
              [],
              false,
              'greatGrandfather'
            ),
            getYearOfBirth('grandfather', 'greatGrandfather'),
            ...placeOfEventInividual(
              'grandfather',
              detailsExist,
              'greatGrandfatherPlaceOfBirth',
              'Birth',
              'greatGrandfather'
            )
          ],
          previewGroups: [
            grandfatherNameInEnglish,
            grandfatherNameInSinhala,
            grandfatherNameInTamil,
            greatGrandfatherNameInSinhala,
            greatGrandfatherNameInTamil,
            grandfatherPlaceOfBirth,
            greatGrandfatherPlaceOfBirth
          ]
        }
      ]
    },
    documentsSection, // REQUIRED SECTION FOR DOCUMENT ATTACHMENTS
    previewSection, // REQUIRED SECTION TO PREVIEW DECLARATION BEFORE SUBMIT
    reviewSection // REQUIRED SECTION TO REVIEW SUBMITTED DECLARATION
  ]
}
