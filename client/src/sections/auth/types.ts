// Matches server/DTOs/MeDto.cs.
export interface MeDto {
  userId: number;
  name: string;
  email: string;
  roleCode: string;
  roleLabel: string;
}

// Mirrors CodeConstants.UserRoles on the server. Compare roles on these values, never on an id. The server
// stays the authority: the client only uses them to decide what to show.
export const ADMIN_ROLE_CODE = 'Admin';
export const SYS_ADMIN_ROLE_CODE = 'SysAdmin';
export const SUPER_ADMIN_ROLE_CODE = 'SuperAdmin';

// Mirrors server/Auth/Roles.cs. Staff (Admin, SysAdmin, SuperAdmin) may read staff pages; only SysAdmin and
// SuperAdmin may change data and run the review workflow (Admin is read-only).
export const WRITER_ROLE_CODES: readonly string[] = [SYS_ADMIN_ROLE_CODE, SUPER_ADMIN_ROLE_CODE];
export const STAFF_ROLE_CODES: readonly string[] = [ADMIN_ROLE_CODE, ...WRITER_ROLE_CODES];

export function isStaffRole(roleCode: string | undefined): boolean {
  return roleCode !== undefined && STAFF_ROLE_CODES.includes(roleCode);
}

export function canWriteRole(roleCode: string | undefined): boolean {
  return roleCode !== undefined && WRITER_ROLE_CODES.includes(roleCode);
}
