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
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import {
  shouldForwardBirthRegistrationToMosip,
  shouldForwardDeathRegistrationToMosip
} from './mosip'

describe('mosip integration tests', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    const mockDate = new Date(2025, 0, 1)
    vi.setSystemTime(mockDate)
  })
  afterAll(() => {
    vi.useRealTimers()
  })

  describe('verify if the birth id creation logic works', () => {
    describe('should not forward to mosip', () => {
      test('when neither mother nor father is verified', () => {
        expect(
          shouldForwardBirthRegistrationToMosip({
            'child.dob': '2024-3-2',
            'mother.verified': null,
            'father.verified': null
          })
        ).toEqual({
          valid: false,
          reason:
            'At least one parent identity must be verified or authenticated'
        })
      })

      test('when child is older than 10 years', () => {
        expect(
          shouldForwardBirthRegistrationToMosip({
            'child.dob': '2014-12-31',
            'mother.verified': 'verified'
          })
        ).toEqual({
          valid: false,
          reason: 'Child is older than 10 years, cannot forward to MOSIP'
        })
      })

      test("when the child's date of birth is missing", () => {
        expect(
          shouldForwardBirthRegistrationToMosip({
            'mother.verified': 'verified'
          })
        ).toEqual({
          valid: false,
          reason: 'Child date of birth not provided'
        })
      })
    })

    describe('should forward to mosip', () => {
      test('when child is below 10 years and mother or father is verified', () => {
        expect(
          shouldForwardBirthRegistrationToMosip({
            'child.dob': '2020-5-5',
            'mother.verified': 'verified'
          })
        ).toEqual({ valid: true })
      })

      test('when child is below 10 years and a parent is authenticated', () => {
        expect(
          shouldForwardBirthRegistrationToMosip({
            'child.dob': '2020-5-5',
            'father.verified': 'authenticated'
          })
        ).toEqual({ valid: true })
      })
    })
  })

  describe('verify if the death id creation logic works', () => {
    describe('should not forward to mosip', () => {
      test('when the informant is the spouse but the spouse is unverified', () => {
        expect(
          shouldForwardDeathRegistrationToMosip({
            'informant.relation': 'SPOUSE',
            'spouse.verified': 'failed'
          })
        ).toEqual({
          valid: false,
          reason: 'Spouse identity not verified or authenticated'
        })
      })

      test('when the informant is not the spouse and is unverified', () => {
        expect(
          shouldForwardDeathRegistrationToMosip({
            'informant.relation': 'SON',
            'informant.verified': 'failed'
          })
        ).toEqual({
          valid: false,
          reason: 'Informant identity not verified or authenticated'
        })
      })
    })

    describe('should forward to mosip', () => {
      test('when the informant is the verified spouse', () => {
        expect(
          shouldForwardDeathRegistrationToMosip({
            'informant.relation': 'SPOUSE',
            'spouse.verified': 'verified'
          })
        ).toEqual({ valid: true })
      })

      test('when the informant is not the spouse but is authenticated', () => {
        expect(
          shouldForwardDeathRegistrationToMosip({
            'informant.relation': 'SON',
            'informant.verified': 'authenticated'
          })
        ).toEqual({ valid: true })
      })
    })
  })
})
