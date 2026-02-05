const ApiResponse = require('../utils/apiResponse');

const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(new ApiResponse(401, null, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(new ApiResponse(403, null, 'Access denied. Insufficient permissions.'));
    }

    // Additional permission checks for staff
    if (req.user.role === 'staff') {
      const requiredPermission = getRequiredPermission(req.route.path, req.method);
      
      if (requiredPermission && (!req.user.permissions || !req.user.permissions.includes(requiredPermission))) {
        return res.status(403).json(new ApiResponse(403, null, 'Access denied. Missing required permission.'));
      }
    }

    next();
  };
};

const getRequiredPermission = (path, method) => {
  // Profile routes don't need permission checks
  if (path.includes('/profile') || path.includes('/change-password')) {
    return null;
  }

  // Reports routes don't need permission checks for staff (they can view basic reports)
  if (path.includes('/reports')) {
    return null;
  }

  // Students route doesn't need permission checks for staff
  if (path.includes('/students')) {
    return null;
  }

  // Define permission mapping based on routes
  const permissionMap = {
    '/maintenance': 'maintenance',
    '/rooms': 'room_management'
  };

  for (const [routePath, permission] of Object.entries(permissionMap)) {
    if (path.includes(routePath)) {
      return permission;
    }
  }

  return null;
};

module.exports = roleAuth;