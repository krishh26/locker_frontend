import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import jsonData from 'src/url.json'
import { showMessage } from './fuse/messageSlice'

const URL_BASE_LINK = jsonData.API_LOCAL_URL

interface ProgressExclusionData {
  course_id: number | string
  excluded_statuses: string[]
}

interface ProgressExclusionState {
  data: ProgressExclusionData | null
  dataFetchLoading: boolean
  dataUpdatingLoading: boolean
}

const initialState: ProgressExclusionState = {
  data: null,
  dataFetchLoading: false,
  dataUpdatingLoading: false,
}

const progressExclusionSlice = createSlice({
  name: 'progressExclusion',
  initialState,
  reducers: {
    updateProgressExclusion(state, action) {
      state.data = action.payload
    },
    setLoader(state, action) {
      state.dataFetchLoading = action.payload
    },
    setUpdateLoader(state, action) {
      state.dataUpdatingLoading = action.payload
    },
    resetProgressExclusion(state) {
      state.data = null
    },
  },
})

export default progressExclusionSlice.reducer

export const selectProgressExclusion = ({ progressExclusion }: any) =>
  progressExclusion

/**
 * Fetch progress exclusion settings for a specific course
 */
export const fetchProgressExclusionAPI =
  (courseId: number | string) => async (dispatch: any) => {
    try {
      dispatch(progressExclusionSlice.actions.setLoader(true))

      const url = `${URL_BASE_LINK}/progress-exclusion/${courseId}`
      const response = await axios.get(url)

      dispatch(progressExclusionSlice.actions.updateProgressExclusion(response.data))
      dispatch(progressExclusionSlice.actions.setLoader(false))
      return true
    } catch (err: any) {
      // If no exclusion settings exist yet, that's okay
      if (err.response?.status === 404) {
        dispatch(progressExclusionSlice.actions.updateProgressExclusion(null))
      } else {
        dispatch(
          showMessage({
            message: err.response?.data?.message || 'Error fetching exclusion settings',
            variant: 'error',
          })
        )
      }
      dispatch(progressExclusionSlice.actions.setLoader(false))
      return false
    }
  }

/**
 * Update progress exclusion settings for a course
 */
export const updateProgressExclusionAPI =
  (data: { course_id: number | string; excluded_statuses: string[] }) =>
  async (dispatch: any) => {
    try {
      dispatch(progressExclusionSlice.actions.setUpdateLoader(true))

      const url = `${URL_BASE_LINK}/progress-exclusion`
      const response = await axios.post(url, data)

      dispatch(progressExclusionSlice.actions.updateProgressExclusion(response.data))
      dispatch(progressExclusionSlice.actions.setUpdateLoader(false))
      return true
    } catch (err: any) {
      dispatch(
        showMessage({
          message:
            err.response?.data?.message || 'Error updating exclusion settings',
          variant: 'error',
        })
      )
      dispatch(progressExclusionSlice.actions.setUpdateLoader(false))
      return false
    }
  }

/**
 * Reset progress exclusion state
 */
export const resetProgressExclusion = () => (dispatch: any) => {
  dispatch(progressExclusionSlice.actions.resetProgressExclusion())
}

