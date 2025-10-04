/* eslint-disable import/extensions */
import { combineReducers } from '@reduxjs/toolkit'
import fuse from './fuse'
import i18n from './i18nSlice'
import user from './userSlice'
import userManagement from './userManagement'
import learnerManagement from './learnerManagement'
import courseManagement from './courseManagement'
import resourceManagement from './resourcesManagement'
import cpdPlanning from './cpdPlanning'
import cpdLearner from './cpdLearner'
import supportData from './supportData'
import yourInnovation from './yourInnovation'
import assignment from './assignment'
import session from './session'
import formData from './formData'
import storeData from './reloadData'
import notification from './notification'
import forumData from './forum'
import skillsScan from './skillsScan'
import employer from './employer'
import globalUser from './globalUser'
import timeLog from './timeLog'
import broadcast from './broadcast'
import contractWork from './contractedWork'
import learnersWaitingToBeSampled from './learnersWaitingToBeSampled'

import { evidenceAPI } from './api/evidence-api'
import { learnerPlanAPI } from './api/learner-plan-api'
import { formAPI } from './api/form-api'
import { fundingBandAPI } from './api/funding-band-api'
import { caseloadAPI } from './api/caseload-api'
import { trainerRiskAPI } from './api/trainer-risk-rating-api'
import { resourcesApi } from './api/resourcesApi'
import { safeguardingAPI } from './api/safeguarding-api'
import { acknowledgementApi } from './api/acknowledgementApi'
import { defaultReviewWeeksApi } from './api/default-review-weeks-api'
import { awaitingSignatureAPI } from './api/awaiting-signature-api'

const createReducer = (asyncReducers) => (state, action) => {
  const combinedReducer = combineReducers({
    fuse,
    i18n,
    user,
    userManagement,
    learnerManagement,
    courseManagement,
    cpdPlanning,
    cpdLearner,
    resourceManagement,
    supportData,
    yourInnovation,
    assignment,
    session,
    formData,
    storeData,
    notification,
    forumData,
    skillsScan,
    employer,
    globalUser,
    timeLog,
    broadcast,
    contractWork,
    learnersWaitingToBeSampled,

    // Add the API reducer
    [evidenceAPI.reducerPath]: evidenceAPI.reducer,
    [learnerPlanAPI.reducerPath]: learnerPlanAPI.reducer,
    [formAPI.reducerPath]: formAPI.reducer,
    [fundingBandAPI.reducerPath]: fundingBandAPI.reducer,
    [caseloadAPI.reducerPath]: caseloadAPI.reducer,
    [trainerRiskAPI.reducerPath]: trainerRiskAPI.reducer,
    [resourcesApi.reducerPath]: resourcesApi.reducer,
    [safeguardingAPI.reducerPath]: safeguardingAPI.reducer,
    [acknowledgementApi.reducerPath]: acknowledgementApi.reducer,
    [defaultReviewWeeksApi.reducerPath]: defaultReviewWeeksApi.reducer,
    [awaitingSignatureAPI.reducerPath]: awaitingSignatureAPI.reducer,
    ...asyncReducers,
  })

  if (action.type === 'user/userLoggedOut') {
    // state = undefined;
  }

  return combinedReducer(state, action)
}

export const concatMiddleware = [
  // Add the API middleware
  evidenceAPI.middleware,
  learnerPlanAPI.middleware,
  formAPI.middleware,
  fundingBandAPI.middleware,
  caseloadAPI.middleware,
  trainerRiskAPI.middleware,
  resourcesApi.middleware,
  safeguardingAPI.middleware,
  acknowledgementApi.middleware,
  defaultReviewWeeksApi.middleware,
  awaitingSignatureAPI.middleware,
]

export default createReducer
