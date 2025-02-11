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

import { verify } from '@opencrvs/mosip'
import type * as Hapi from '@hapi/hapi'
import { env } from '@countryconfig/environment'
/**
 * Checks if the request payload is verified by the identity system.
 *
 * @param request - The Hapi request object containing the payload to be verified.
 * @returns A boolean indicating whether the payload is verified.
 */
export async function isVerified(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const processedBundle = (await verify({
    url: env.isProd ? 'http://mosip-api:2024' : 'http://localhost:2024'
  })(request, h)) as unknown as fhir.Bundle
  const questionnaireResponse = processedBundle.entry?.find(
    (e): e is fhir.BundleEntry =>
      e.resource?.resourceType === 'QuestionnaireResponse'
  )?.resource as fhir.QuestionnaireResponse
  const verifiedQuestions = questionnaireResponse?.item?.filter((i) =>
    [
      'birth.informant.informant-view-group.verified',
      'birth.mother.mother-view-group.verified',
      'birth.father.father-view-group.verified',
      'death.informant.informant-view-group.verified',
      'death.spouse.spouse-view-group.verified'
    ].includes(i.text!)
  )
  return verifiedQuestions && verifiedQuestions.length > 0
    ? !verifiedQuestions.some((q) => q.answer?.[0]?.valueString === 'failed')
    : true
}
