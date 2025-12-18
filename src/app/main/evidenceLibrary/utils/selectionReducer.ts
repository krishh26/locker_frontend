import { SelectionState, SelectionAction } from '../types'

export const selectionReducer = (state: SelectionState, action: SelectionAction): SelectionState => {
  switch (action.type) {
    case 'TOGGLE_COURSE': {
      const newSelectedCourses = new Set(state.selectedCourses)
      if (newSelectedCourses.has(action.courseId)) {
        newSelectedCourses.delete(action.courseId)
      } else {
        newSelectedCourses.add(action.courseId)
      }
      return { ...state, selectedCourses: newSelectedCourses }
    }
    case 'TOGGLE_FILE': {
      const newSelectedFiles = new Set(state.selectedFiles)
      if (newSelectedFiles.has(action.fileId)) {
        newSelectedFiles.delete(action.fileId)
      } else {
        newSelectedFiles.add(action.fileId)
      }
      return { ...state, selectedFiles: newSelectedFiles }
    }
    case 'SELECT_ALL_COURSES': {
      return { ...state, selectedCourses: new Set(action.courseIds), selectAll: true }
    }
    case 'SELECT_ALL_FILES': {
      return { ...state, selectedFiles: new Set(action.fileIds), selectAllFiles: true }
    }
    case 'DESELECT_ALL_COURSES': {
      return { ...state, selectedCourses: new Set(), selectAll: false }
    }
    case 'DESELECT_ALL_FILES': {
      return { ...state, selectedFiles: new Set(), selectAllFiles: false }
    }
    case 'SYNC_SELECT_ALL_COURSES': {
      const allSelected = action.courseIds.length > 0 && 
        action.courseIds.every(id => action.selectedCourses.has(id))
      return { ...state, selectAll: allSelected }
    }
    case 'SYNC_SELECT_ALL_FILES': {
      const allSelected = action.fileIds.length > 0 && 
        action.fileIds.every(id => action.selectedFiles.has(id))
      return { ...state, selectAllFiles: allSelected }
    }
    case 'RESET_COURSES': {
      return { ...state, selectedCourses: new Set(), selectAll: false }
    }
    case 'RESET_FILES': {
      return { ...state, selectedFiles: new Set(), selectAllFiles: false }
    }
    default:
      return state
  }
}

