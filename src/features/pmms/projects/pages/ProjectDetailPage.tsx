import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { isApiError } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import {
  ErrorState,
  LoadingState,
  NotFoundState,
} from '@/shared/components/states'
import { getIndicatorMeta } from '../../shared/indicatorMeta'
import { ProjectActions } from '../components/ProjectActions'
import { ProjectAdminActions } from '../components/ProjectAdminActions'
import { ProjectHistory } from '../components/ProjectHistory'
import { ProjectInformation } from '../components/ProjectInformation'
import { ProjectSummary } from '../components/ProjectSummary'
import { ProgressReports } from '../components/ProgressReports'
import { useProject } from '../hooks/useProject'

export function ProjectDetailPage() {
  const navigate = useNavigate()
  const { projectId: projectIdParam } = useParams()
  const parsedId = Number.parseInt(projectIdParam ?? '', 10)
  const projectId =
    Number.isInteger(parsedId) && String(parsedId) === projectIdParam
      ? parsedId
      : 0

  const { data: project, isPending, isError, error, refetch } = useProject(
    projectId,
  )

  const backButton = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2"
      onClick={() => navigate('/pmms/projects')}
    >
      <ArrowLeft aria-hidden="true" />
      Projects
    </Button>
  )

  if (projectId <= 0) {
    return (
      <div className="space-y-5">
        {backButton}
        <NotFoundState
          title="Project not found"
          description="The project identifier is not valid."
        />
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="space-y-5">
        {backButton}
        <LoadingState label="Loading project" />
      </div>
    )
  }

  if (isError) {
    if (isApiError(error) && error.isNotFound) {
      return (
        <div className="space-y-5">
          {backButton}
          <NotFoundState
            title="Project not found"
            description="This project does not exist, or it is not within your access scope."
          />
        </div>
      )
    }

    return (
      <div className="space-y-5">
        {backButton}
        <ErrorState
          error={error}
          title="The project could not be loaded"
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  if (!project) {
    return null
  }

  const meta = getIndicatorMeta(project.indicator)
  const descriptionParts = [
    project.category?.name,
    String(project.implementation_year),
    project.contract_number,
    project.location,
  ].filter((part): part is string => Boolean(part && part.trim()))

  return (
    <div className="space-y-5">
      {backButton}

      <PageHeader
        title={project.project_name}
        description={descriptionParts.join(' \u00b7 ')}
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{project.status_label}</Badge>
            <Badge className={meta.badgeClassName}>
              {project.indicator_label}
            </Badge>
          </div>
        }
      />

      <ProjectSummary project={project} />
      <ProjectActions project={project} />
      <ProjectAdminActions project={project} />
      <ProjectInformation project={project} />

      <div className="space-y-6">
        <ProgressReports projectId={project.id} />
        <ProjectHistory projectId={project.id} />
      </div>
    </div>
  )
}
