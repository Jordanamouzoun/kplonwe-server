export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
  SCHOOL: 'SCHOOL'
};

export const PERMISSIONS = {
  ADMIN: {
    all: ['create', 'read', 'update', 'delete', 'validate', 'moderate']
  },
  TEACHER: {
    profile: ['read', 'update'],
    quiz: ['create', 'read', 'update', 'delete', 'assign'],
    wallet: ['read']
  },
  PARENT: {
    profile: ['read', 'update'],
    wallet: ['read', 'recharge'],
    payment: ['create']
  },
  STUDENT: {
    profile: ['read', 'update'],
    quiz: ['take', 'read']
  },
  SCHOOL: {
    profile: ['read', 'update'],
    quiz: ['create', 'read', 'update', 'delete'],
    wallet: ['read', 'recharge']
  }
};

export const hasPermission = (role, resource, action) => {
  const rolePerms = PERMISSIONS[role];
  if (!rolePerms) return false;
  if (rolePerms.all) return true;
  const resourcePerms = rolePerms[resource];
  return resourcePerms && resourcePerms.includes(action);
};

export default { ROLES, PERMISSIONS, hasPermission };
