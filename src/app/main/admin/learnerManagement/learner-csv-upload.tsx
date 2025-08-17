import React, { useState } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import { useDispatch } from 'react-redux'
import Papa from 'papaparse'
import { createAssignmentAPI } from 'app/store/assignment'
import { useNavigate } from 'react-router-dom'
import {
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import { useUploadLearnerDataMutation } from 'app/store/api/learner-plan-api'
import { showMessage } from 'app/store/fuse/messageSlice'

const UploadWorkDialog = ({ handleClose }) => {
  const dispatch: any = useDispatch()
  const navigate = useNavigate()
  const fileTypes = ['CSV']
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  const requiredFields = ['First Names', 'Surname', 'Title', 'Sex', 'Courses']

  const [uploadLearnerData, { isLoading }] = useUploadLearnerDataMutation()

  const handleChange = (file: File) => {
    setFile(file)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[]

        // ✅ validation for required fields
        const invalidRow = rows.find((row) =>
          requiredFields.some(
            (field) => !row[field] || row[field].toString().trim() === ''
          )
        )

        if (invalidRow) {
          setError(
            'Some learner details are missing. Please check that every row includes First Name, Surname, Title, and Sex.'
          )
          setParsedData([])
        } else {
          setError('')
          setParsedData(
            rows.map((row) => {
              return {
                ...row,
                Courses: row.Courses ? row.Courses.split(',') : [],
              }
            })
          )
        }
      },
    })
  }

  const uploadHandler = async () => {
    if (!file) return
    if (parsedData.length === 0) {
      setError('No valid data found. Please upload a proper CSV file.')
      return
    }
    console.log('🚀 ~ uploadHandler ~ parsedData:', parsedData)

    // try {
    //   const response = await uploadLearnerData(parsedData).unwrap()
    //   if (response.status) {
    //     dispatch(
    //       showMessage({
    //         message: 'Upload Learner Data Successfully.',
    //         variant: 'success',
    //       })
    //     )
    //     handleClose()
    //   }
    // } catch {
    //   console.error('Error uploading file:', 'File upload failed')
    //   dispatch(showMessage({ message: 'File upload failed', variant: 'error' }))
    //   return
    // }
  }

  return (
    <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded border border-gray-300 max-w-md w-full shadow-md'>
      <div className='font-semibold mb-2'>Upload Learner CSV</div>

      <FileUploader
        children={
          <div
            style={{
              border: '1px dotted lightgray',
              padding: '5rem',
              cursor: 'pointer',
            }}
          >
            <div className='flex justify-center mt-8'>
              <img
                src='assets/images/svgImage/uploadimage.svg'
                alt='Upload'
                className='w-36'
              />
            </div>
            {file ? (
              <p className='text-center mb-4'>{file.name}</p>
            ) : (
              <>
                <p className='text-center mb-4'>
                  Drag and drop your CSV file here or{' '}
                  <span className='text-blue-500'>Browse</span>
                </p>
                <p className='text-center mb-4'>Max 10MB files are allowed</p>
              </>
            )}
          </div>
        }
        handleChange={handleChange}
        name='file'
        types={fileTypes}
      />

      {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}

      <div className='flex justify-end mt-4'>
        <SecondaryButtonOutlined
          name='Cancel'
          style={{ width: '10rem', marginRight: '2rem' }}
          onClick={handleClose}
        />
        <SecondaryButton
          name='Upload'
          style={{ width: '10rem' }}
          onClick={uploadHandler}
          disable={!file || parsedData.length === 0}
        />
      </div>
    </div>
  )
}

export default UploadWorkDialog
