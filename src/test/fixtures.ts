import type {
  AuthUser,
  Permission,
  Role,
} from '@/shared/types/api'

let permissionId = 1

export function makePermission(name: string): Permission {
  const module = name.split('.')[0] ?? 'shared'
  const permission: Permission = {
    id: permissionId,
    name,
    module,
    is_system: true,
    created_at: null,
    updated_at: null,
  }

  permissionId += 1

  return permission
}

export function makeRole(
  name = 'viewer',
  label = 'Viewer',
): Role {
  return {
    id: 1,
    name,
    label,
    is_system: true,
    created_at: null,
    updated_at: null,
  }
}

export function makeUser({
  permissions = [],
  role = makeRole(),
  overrides = {},
}: {
  permissions?: string[]
  role?: Role
  overrides?: Partial<AuthUser>
} = {}): AuthUser {
  return {
    id: 1,
    full_name: 'Test User',
    email: 'test.user@example.com',
    section: 'Data Management Section',
    is_active: true,
    last_login_at: null,
    role,
    permissions: permissions.map(makePermission),
    created_at: '2026-01-01T00:00:00+08:00',
    updated_at: '2026-01-01T00:00:00+08:00',
    deleted_at: null,
    ...overrides,
  }
}
