import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/shared/components/PageHeader'
import { ErrorState, LoadingState } from '@/shared/components/states'
import { useToast } from '@/shared/components/toast/toast-context'
import { ProjectForm } from '../components/ProjectForm'
import { useCreateProject } from '../hooks/useCreateProject'
import { useProjectCategories } from '../hooks/useProjectCategories'
import { toProjectPayload, type ProjectFormValues } from '../schemas/projectSchema'

export function NewProjectPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const categoriesQuery = useProjectCategories()
  const createProject = useCreateProject()

  async function handleSubmit(values: ProjectFormValues) {
    const project = await createProject.mutateAsync(toProjectPayload(values))

    toast.success(
      'Project registered',
      `${project.project_name} is now in the project registry.`,
    )
    navigate(`/pmms/projects/${project.id}`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Register project"
        description="Enter the details from the approved project form. You become the assigned Project Engineer, and the status and progress are set by the backend."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/pmms/projects')}
          >
            Back to projects
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
          categories={categoriesQuery.data.data}
          isSubmitting={createProject.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/pmms/projects')}
        />
      ) : null}
    </div>
  )
}
