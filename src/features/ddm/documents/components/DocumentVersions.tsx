import { formatBytes, formatDateTime } from '@/shared/lib/formatters'
import type { DocumentVersion } from '@/shared/types/api'

type DocumentVersionsProps = {
  versions: DocumentVersion[]
}

export function DocumentVersions({ versions }: DocumentVersionsProps) {
  if (versions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-card px-4 py-6 text-center text-sm text-muted-foreground">
        No versions have been recorded for this document.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">Document version history</caption>
        <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">
              Version
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              File
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Change note
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Uploaded by
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Uploaded at
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {versions.map((version) => (
            <tr key={version.id} className="align-top">
              <td className="px-4 py-3 whitespace-nowrap text-foreground">
                v{version.version_number}
              </td>
              <td className="px-4 py-3">
                <p className="text-foreground">{version.original_name}</p>
                <p className="text-xs text-muted-foreground">
                  {version.mime_type} &middot; {formatBytes(version.file_size)}
                </p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {version.change_note ?? '\u2014'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {version.uploader?.full_name ?? '\u2014'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatDateTime(version.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
