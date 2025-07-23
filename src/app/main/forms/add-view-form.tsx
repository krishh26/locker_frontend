import { Box, CircularProgress } from '@mui/material'
import DynamicFormPreview from './DynamicFormPreview'
import {
  useGetFormDetailsQuery,
  useGetSavedFormDetailsQuery,
} from 'app/store/api/form-api'
import { useEffect, useState } from 'react'
import { redirect, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'
import type { SimpleFormField } from 'src/app/component/FormBuilder'
import { selectFormData } from 'app/store/formData'

const AddViewForm = () => {
  const param = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const formId: string | boolean = param?.id ?? false
  const isSavedViewedPath =
    location.pathname === `/forms/view-saved-form/${formId}`
  const isViewedPath = location.pathname === `/forms/view-form/${formId}`

  const [formFields, setFormFields] = useState<SimpleFormField[]>([])
  const [formData, setFormData] = useState<any>({})
  const [savedFormData, setSavedFormData] = useState<any>({})

  const dispatch: any = useDispatch()
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
      skip: !formId,
      refetchOnMountOrArgChange: false,
    }
  )

  // const {
  //   data: savedFormDetails,
  //   isLoading: isSavedFormDetailsLoading,
  //   isError: isSavedFormDetailsError,
  //   error: savedFormDetailsError,
  // } = useGetSavedFormDetailsQuery(
  //   {
  //     id: formId,
  //   },
  //   {
  //     skip: true,
  //     refetchOnMountOrArgChange: false,
  //   }
  // )

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

  // useEffect(() => {
  //   if (isSavedFormDetailsError && savedFormDetailsError) {
  //     console.error('Error fetching saved form details:', savedFormDetailsError)
  //     dispatch(
  //       showMessage({
  //         message: 'Error fetching saved form details',
  //         variant: 'error',
  //       })
  //     )
  //     navigate('/forms')
  //   }

  //   if (savedFormDetails && !isSavedFormDetailsLoading) {
  //     console.log('🚀 ~ useEffect ~ savedFormDetails:', savedFormDetails)

  //     // const { form_name, type, form_data, description } = savedFormDetails.data

  //     // setFormData({
  //     //   form_name,
  //     //   type,
  //     //   description,
  //     // })

  //     // setFormFields(form_data)
  //   }
  // }, [
  //   savedFormDetails,
  //   isSavedFormDetailsLoading,
  //   isSavedFormDetailsError,
  //   savedFormDetailsError,
  // ])

  useEffect(() => {
    if (isSavedViewedPath && Object.keys(formDataDetails).length === 0) {
      navigate(`/forms`)
    }
  }, [formDataDetails, isSavedViewedPath])

  if (isFormDetailsLoading) {
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
      />
    </Box>
  )
}

export default AddViewForm
