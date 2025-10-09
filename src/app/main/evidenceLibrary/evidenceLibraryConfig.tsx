import { lazy } from 'react'
const EvidenceLibraryView = lazy(() => import('./evidenceLibrary'))
const CreateViewEvidenceLibrary = lazy(() => import('./createViewEvidenceLibrary'))
import authRoles from 'src/app/auth/authRoles'

const EvidenceLibraryConfig = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: true,
        },
        toolbar: {
          display: true,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: true,
        },
        rightSidePanel: {
          display: true,
        },
      },
    },
  },
  auth: [authRoles.Learner , authRoles.Trainer,authRoles.Admin],
  routes: [
    {
      path: '/evidenceLibrary',
      element: <EvidenceLibraryView />,
    },
    {
      path: '/evidenceLibrary/:id',
      element: <CreateViewEvidenceLibrary />,
    },
  ],
}

export default EvidenceLibraryConfig
