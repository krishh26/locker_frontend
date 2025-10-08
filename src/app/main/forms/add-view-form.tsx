import { Box, CircularProgress } from '@mui/material'
import {
  useGetFormDetailsQuery,
  useGetSavedFormDetailsQuery,
} from 'app/store/api/form-api'
import { selectFormData, slice } from 'app/store/formData'
import { showMessage } from 'app/store/fuse/messageSlice'
import { selectGlobalUser } from 'app/store/globalUser'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { SimpleFormField } from 'src/app/component/FormBuilder'
import DynamicFormPreview from './DynamicFormPreview'

const AddViewForm = () => {
  const param = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const formId: string | boolean = param?.id ?? false
  const userId: string | boolean = param?.userId ?? false
  const isSavedViewedPath =
    location.pathname === `/forms/view-saved-form/${formId}/user/${userId}`
  const isViewedPath = location.pathname === `/forms/view-form/${formId}`

  const [formFields, setFormFields] = useState<SimpleFormField[]>([])
  const [formData, setFormData] = useState<any>({})
  const [savedFormData, setSavedFormData] = useState<any>({})
  const [isLocked, setIsLocked] = useState(false)
  const dispatch: any = useDispatch()

  const currentUser =
    JSON.parse(sessionStorage.getItem('learnerToken'))?.user ||
    useSelector(selectGlobalUser)?.currentUser
  const {
    data,
    formDataDetails,
    dataUpdatingLoadding,
    singleData,
    mode,
    singleFrom = null,
    modeTemaplate = '',
  } = useSelector(selectFormData)

  const {
    data: formDetails,
    isLoading: isFormDetailsLoading,
    isError: isFormDetailsError,
    error: formDetailsError,
  } = useGetFormDetailsQuery(
    {
      id: formId,
    },
    {
      skip: !formId || isSavedViewedPath,
      refetchOnMountOrArgChange: false,
    }
  )

  const {
    data: savedFormDetails,
    isLoading: isSavedFormDetailsLoading,
    isError: isSavedFormDetailsError,
    error: savedFormDetailsError,
  } = useGetSavedFormDetailsQuery(
    {
      formId,
      userId: currentUser?.user_id || userId,
    },
    {
      refetchOnMountOrArgChange: false,
    }
  )

  useEffect(() => {
    if (isFormDetailsError && formDetailsError) {
      console.error('Error fetching form details:', formDetailsError)
      dispatch(
        showMessage({
          message: 'Error fetching form details',
          variant: 'error',
        })
      )
      navigate('/forms')
    }

    if (formDetails && !isFormDetailsLoading) {
      const { form_name, type, form_data, description } = formDetails.data

      setFormData({
        form_name,
        type,
        description,
      })

      setFormFields(form_data)
    }
  }, [formDetails, isFormDetailsLoading, isFormDetailsError, formDetailsError])

  useEffect(() => {
    if (isSavedFormDetailsError && savedFormDetailsError) {
      // console.error('Error fetching saved form details:', savedFormDetailsError)
      // dispatch(
      //   showMessage({
      //     message: 'Error fetching saved form details',
      //     variant: 'error',
      //   })
      // )
      // navigate('/forms')
    }

    if (savedFormDetails && !isSavedFormDetailsLoading) {
      const { form_name, type, form_data, description } =
        savedFormDetails.data.form

        const { is_locked } = savedFormDetails.data

      setFormData({
        form_name,
        type,
        description,
      })

      setFormFields(form_data)
      setIsLocked(is_locked)
      dispatch(slice.setFormDataDetails(savedFormDetails.data.form_data))
    }
  }, [
    savedFormDetails,
    isSavedFormDetailsLoading,
    isSavedFormDetailsError,
    savedFormDetailsError,
  ])

  if (isFormDetailsLoading || isSavedFormDetailsLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          fontSize: '24px',
          fontWeight: 'bold',
          gap: '10px',
        }}
      >
        <CircularProgress />
        please wait while we load the form details...
      </div>
    )
  }

  return (
    <Box
      sx={{
        p: 3,
        m: 2,
        height: 'calc(100% - 32px)',
        backgroundColor: '#f5f5f5',
        borderRadius: 3,
        overflow: 'auto',
      }}
    >
      <DynamicFormPreview
        fields={formFields}
        formName={formData.form_name}
        description={formData.description}
        savedFormData={savedFormData}
        isLocked={isLocked}
      />
    </Box>
  )
}

export default AddViewForm
