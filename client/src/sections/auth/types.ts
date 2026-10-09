// Matches server/DTOs/MeDto.cs.
export interface MeDto {
  userId: number;
  name: string;
  email: string;
  roleCode: string;
  roleLabel: string;
}

// Mirrors CodeConstants.UserRoles.Admin on the server. Compare roles on this value, never on an id.
// The server stays the authority: the client only uses it to decide what to show.
export const ADMIN_ROLE_CODE = 'Admin';
