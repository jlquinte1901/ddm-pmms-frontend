import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { isApiError } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import {
  ErrorState,
  LoadingState,
  NotFoundState,
} from '@/shared/components/states'
import { useToast } from '@/shared/components/toast/toast-context'
import { ProjectForm } from '../components/ProjectForm'
import { useProject } from '../hooks/useProject'
import { useProjectCategories } from '../hooks/useProjectCategories'
import { useUpdateProject } from '../hooks/useUpdateProject'
import {
  toProjectFormValues,
  toProjectUpdatePayload,
  type ProjectFormValues,
} from '../schemas/projectSchema'

export function EditProjectPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { projectId: projectIdParam } = useParams()
  const parsedId = Number.parseInt(projectIdParam ?? '', 10)
  const projectId =
    Number.isInteger(parsedId) && String(parsedId) === projectIdParam
      ? parsedId
      : 0

  const projectQuery = useProject(projectId)
  const categoriesQuery = useProjectCategories()
  const updateProject = useUpdateProject()

  async function handleSubmit(values: ProjectFormValues) {
    const project = await updateProject.mutateAsync({
      projectId,
      payload: toProjectUpdatePayload(values),
    })

    toast.success('Project updated', 'The project details have been saved.')
    navigate(`/pmms/projects/${project.id}`)
  }

  if (projectId <= 0) {
    return (
      <div className="space-y-5">
        <NotFoundState title="Project not found" description="The project identifier is not valid." />
      </div>
    )
  }

  if (projectQuery.isPending) {
    return <LoadingState label="Loading project" />
  }

  if (projectQuery.isError) {
    if (isApiError(projectQuery.error) && projectQuery.error.isNotFound) {
      return (
        <NotFoundState
          title="Project not found"
          description="This project does not exist, or it is not within your access scope."
        />
      )
    }

    return (
      <ErrorState
        error={projectQuery.error}
        title="The project could not be loaded"
        onRetry={() => void projectQuery.refetch()}
      />
    )
  }

  if (!projectQuery.data) {
    return null
  }

  const project = projectQuery.data

  return (
    <div className="space-y-5">
      <PageHeader
        title="Edit project"
        description={project.project_name}
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/pmms/projects/${project.id}`)}
          >
            Back to project
          </Button>
        }
      />

      {categoriesQuery.isPending ? (
        <LoadingState label="Loading project categories" />
      ) : null}

      {categoriesQuery.isError ? (
        <ErrorState
          error={categoriesQuery.error}
          title="Project categories could not be loaded"
          onRetry={() => void categoriesQuery.refetch()}
        />
      ) : null}

      {categoriesQuery.data ? (
        <ProjectForm
          mode="edit"
          categories={categoriesQuery.data.data}
          initialValues={toProjectFormValues(project)}
          isSubmitting={updateProject.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/pmms/projects/${project.id}`)}
        />
      ) : null}
    </div>
  )
}
