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
import { tennisClubMembershipEvent } from '@countryconfig/form/tennis-club-membership'
import { birthEvent } from '@countryconfig/form/v2/birth'
import { deathEvent } from '@countryconfig/form/v2/death'
import * as Hapi from '@hapi/hapi'
import { sendInformantNotification } from '../notification/informantNotification'
import { ActionConfirmationRequest } from '../registration'
import { createMosipInteropClient } from '@opencrvs/mosip/api'
import { openCrvsMosipInteropUrl } from '@countryconfig/utils/mosip'
import { getCurrentEventState } from '@opencrvs/toolkit/events'

export function getCustomEventsHandler(
  _: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h
    .response([tennisClubMembershipEvent, birthEvent, deathEvent])
    .code(200)
}

export async function onAnyActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  // This catch-all event route will receive v2 events with `Content-Type: application/json`

  const token = request.auth.artifacts.token as string

  const event = request.payload
  await sendInformantNotification({ event, token })

  return h.response({}).code(200)
}

export async function onBirthActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  const token = request.auth.artifacts.token as string

  const event = request.payload
  await sendInformantNotification({ event, token })

  const currentState = getCurrentEventState(event, birthEvent)

  const mosipInteropClient = createMosipInteropClient(
    openCrvsMosipInteropUrl,
    `Bearer ${token}`
  )

  const mother = await mosipInteropClient.verifyNid({
    dob: currentState.declaration['mother.dob'],
    nid: currentState.declaration['mother.nationalId'],
    name: currentState.declaration['mother.name'],
    gender: 'female'
  })

  const father = await mosipInteropClient.verifyNid({
    dob: currentState.declaration['father.dob'],
    nid: currentState.declaration['father.nationalId'],
    name: currentState.declaration['father.name'],
    gender: 'male'
  })

  const informant = await mosipInteropClient.verifyNid({
    dob: currentState.declaration['informant.dob'],
    nid: currentState.declaration['informant.nationalId'],
    name: currentState.declaration['informant.name']
  })

  return h
    .response({
      declaration: {
        'mother.verified': mother,
        'father.verified': father,
        'informant.verified': informant
      }
    })
    .code(200)
}

export async function onDeathActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  const token = request.auth.artifacts.token as string

  const event = request.payload
  await sendInformantNotification({ event, token })

  const currentState = getCurrentEventState(event, birthEvent)

  const mosipInteropClient = createMosipInteropClient(
    openCrvsMosipInteropUrl,
    `Bearer ${token}`
  )

  const deceased = await mosipInteropClient.verifyNid({
    dob: currentState.declaration['deceased.dob'],
    nid: currentState.declaration['deceased.nationalId'],
    name: currentState.declaration['deceased.name'],
    gender: currentState.declaration['deceased.gender']
  })

  const informant = await mosipInteropClient.verifyNid({
    dob: currentState.declaration['informant.dob'],
    nid: currentState.declaration['informant.nationalId'],
    name: currentState.declaration['informant.name']
  })

  return h
    .response({
      declaration: {
        'deceased.verified': deceased,
        'informant.verified': informant
      }
    })
    .code(200)
}
