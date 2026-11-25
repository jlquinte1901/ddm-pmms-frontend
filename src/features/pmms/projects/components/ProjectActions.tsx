import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pause, Pencil, Play, RotateCcw, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Can } from '@/shared/auth/Can'
import { PERMISSIONS } from '@/shared/lib/permissions'
import type { Project } from '@/shared/types/api'
import { PauseProjectForm } from './PauseProjectForm'
import { ProgressReportForm } from './ProgressReportForm'
import { ResumeProjectForm } from './ResumeProjectForm'
import { StartProjectForm } from './StartProjectForm'

type ActiveAction = 'start' | 'progress' | 'pause' | 'resume' | null

type ProjectActionsProps = {
  project: Project
}

/**
 * PE-only lifecycle controls. Each button maps to a manage-own endpoint; the
 * backend still enforces ownership and state rules on every call.
 */
export function ProjectActions({ project }: ProjectActionsProps) {
  const [active, setActive] = useState<ActiveAction>(null)

  const { id, status } = project
  const canProgress = status === 'not_started' || status === 'ongoing'
  const canResume = status === 'suspended' || status === 'postponed'

  return (
    <Can permission={PERMISSIONS.PMMS_PROJECTS_MANAGE_OWN}>
      <section
        aria-label="Project actions"
        className="rounded-xl border bg-card p-4"
      >
        <h2 className="text-sm font-semibold text-foreground">Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {status === 'not_started' ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActive('start')}
            >
              <Play aria-hidden="true" />
              Start project
            </Button>
          ) : null}

          {canProgress ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActive('progress')}
            >
              <TrendingUp aria-hidden="true" />
              Report progress
            </Button>
          ) : null}

          {canProgress ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActive('pause')}
            >
              <Pause aria-hidden="true" />
              Pause project
            </Button>
          ) : null}

          {canResume ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActive('resume')}
            >
              <RotateCcw aria-hidden="true" />
              Resume project
            </Button>
          ) : null}

          <Button type="button" variant="outline" asChild>
            <Link to={`/pmms/projects/${id}/edit`}>
              <Pencil aria-hidden="true" />
              Edit details
            </Link>
          </Button>
        </div>

        {active === 'start' ? (
          <StartProjectForm projectId={id} onClose={() => setActive(null)} />
        ) : null}

        {active === 'progress' ? (
          <ProgressReportForm
            projectId={id}
            currentProgress={project.progress_percentage}
            onClose={() => setActive(null)}
          />
        ) : null}

        {active === 'pause' ? (
          <PauseProjectForm projectId={id} onClose={() => setActive(null)} />
        ) : null}

        {active === 'resume' ? (
          <ResumeProjectForm projectId={id} onClose={() => setActive(null)} />
        ) : null}
      </section>
    </Can>
  )
}
