import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ban, CalendarClock, Trash2, Undo2, UserRoundCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Can } from '@/shared/auth/Can'
import { PERMISSIONS } from '@/shared/lib/permissions'
import type { Project } from '@/shared/types/api'
import { CorrectPlannedDatesForm } from './CorrectPlannedDatesForm'
import { DeleteProjectForm } from './DeleteProjectForm'
import { ReassignProjectForm } from './ReassignProjectForm'
import { ReopenProjectForm } from './ReopenProjectForm'
import { TerminateProjectForm } from './TerminateProjectForm'

type ActiveAction =
  | 'terminate'
  | 'reopen'
  | 'reassign'
  | 'delete'
  | 'dates'
  | null

type ProjectAdminActionsProps = {
  project: Project
}

/**
 * Admin/Super Admin actions that require pmms.projects.administer. Each maps
 * to an administer endpoint; the backend remains the authority on state rules.
 */
export function ProjectAdminActions({ project }: ProjectAdminActionsProps) {
  const navigate = useNavigate()
  const [active, setActive] = useState<ActiveAction>(null)

  const { id, status } = project
  const canReopen = status === 'completed' || status === 'terminated'
  const canTerminate = status !== 'terminated'

  return (
    <Can permission={PERMISSIONS.PMMS_PROJECTS_ADMINISTER}>
      <section
        aria-label="Project administration"
        className="rounded-xl border bg-card p-4"
      >
        <h2 className="text-sm font-semibold text-foreground">
          Administration
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {canTerminate ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActive('terminate')}
            >
              <Ban aria-hidden="true" />
              Terminate
            </Button>
          ) : null}

          {canReopen ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActive('reopen')}
            >
              <Undo2 aria-hidden="true" />
              Reopen
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={() => setActive('reassign')}
          >
            <UserRoundCog aria-hidden="true" />
            Reassign
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setActive('dates')}
          >
            <CalendarClock aria-hidden="true" />
            Correct planned dates
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setActive('delete')}
          >
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>

        {active === 'terminate' ? (
          <TerminateProjectForm
            projectId={id}
            onClose={() => setActive(null)}
          />
        ) : null}

        {active === 'reopen' ? (
          <ReopenProjectForm projectId={id} onClose={() => setActive(null)} />
        ) : null}

        {active === 'reassign' ? (
          <ReassignProjectForm projectId={id} onClose={() => setActive(null)} />
        ) : null}

        {active === 'dates' ? (
          <CorrectPlannedDatesForm
            projectId={id}
            initialStart={project.planned_start_date}
            initialFinish={project.planned_finish_date}
            onClose={() => setActive(null)}
          />
        ) : null}

        {active === 'delete' ? (
          <DeleteProjectForm
            projectId={id}
            onCancel={() => setActive(null)}
            onDeleted={() => navigate('/pmms/projects')}
          />
        ) : null}
      </section>
    </Can>
  )
}
