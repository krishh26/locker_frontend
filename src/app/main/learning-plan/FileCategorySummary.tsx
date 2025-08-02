'use client'

import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Link as MuiLink
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ArticleIcon from '@mui/icons-material/Article'
import { useNavigate } from 'react-router-dom'

type UploadType = 'File Upload' | 'Form Selection'

interface DocumentEntry {
  document_id: number
  file_type: string
  upload_type: UploadType
  name?: string
  uploaded_files: {
    file_name: string
    file_size: number
    file_url: string
    s3_key: string
    uploaded_at: string
  }[] | null
  selected_form: {
    id: number
    form_name: string
  } | null
}

export default function FileIconGrid({ data }: { data: DocumentEntry[] }) {
  const navigate = useNavigate()

  return (
    <Box sx={{ border: '1px solid #ddd', p: 2, width: 250, backgroundColor: '#f9f9f9' }}>
      {['ILP File', 'Assessment Files', 'Review Files', 'General Files', 'Evidence'].map((category, idx) => (
        <Box key={idx} mb={2}>
          <Typography fontWeight="bold" variant="body2" gutterBottom>
            {idx + 1}. {category.replace(' Files', '')}:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {data
              .filter((doc) => doc.file_type === category)
              .map((doc) => {
                if (doc.upload_type === 'File Upload' && doc.uploaded_files?.length) {
                  return doc.uploaded_files.map((file, i) => (
                    <Tooltip title={file.file_name} key={i}>
                      <IconButton
                        size="small"
                        color="error"
                        component={MuiLink}
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PictureAsPdfIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ))
                }

                if (doc.upload_type === 'Form Selection' && doc.selected_form) {
                  return (
                    <Tooltip title={doc.selected_form.form_name} key={doc.document_id}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/forms/${doc.selected_form!.id}/submit`)}
                      >
                        <ArticleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }

                return null
              })}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
