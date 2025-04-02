import express from 'express';
import { securityService } from '../security';
import { isAuthenticated } from '../middleware/auth';
import { hasRole } from '../middleware/roleAccess';

const router = express.Router();

// Middleware to restrict access to administrators
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user || req.user.role !== 'administrator') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Get security audit logs
router.get('/audit-logs', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const filters: any = {};
    
    // Parse query parameters for filtering
    if (req.query.userId) filters.userId = parseInt(req.query.userId as string);
    if (req.query.action) filters.action = req.query.action as string;
    if (req.query.severity) filters.severity = req.query.severity as string;
    if (req.query.from) filters.from = new Date(req.query.from as string);
    if (req.query.to) filters.to = new Date(req.query.to as string);
    if (req.query.isResolved !== undefined) 
      filters.isResolved = req.query.isResolved === 'true';
    
    // Get audit logs with filters
    const logs = await securityService.getAuditLogs(filters);
    
    // Join with usernames for easier display
    const logsWithUsernames = await Promise.all(logs.map(async (log) => {
      try {
        const user = await req.app.locals.storage.getUser(log.userId);
        return {
          ...log,
          username: user ? user.username : 'Unknown User'
        };
      } catch (error) {
        return {
          ...log,
          username: 'Unknown User'
        };
      }
    }));
    
    res.json(logsWithUsernames);
  } catch (error) {
    console.error('Error fetching security audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch security audit logs' });
  }
});

// Get security statistics
router.get('/stats', isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Get total events count
    const logs = await securityService.getAuditLogs();
    
    // Calculate statistics
    const totalEvents = logs.length;
    const highSeverity = logs.filter(log => log.severity === 'HIGH').length;
    const unresolvedEvents = logs.filter(log => !log.isResolved).length;
    
    // Get failed login attempts in the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Count failed logins
    const loginFailures = await req.app.locals.db.query(
      `SELECT COUNT(*) as count FROM login_attempts 
       WHERE success = false AND timestamp > $1`,
      [twentyFourHoursAgo]
    );
    
    // Count unique IP addresses
    const ipAddresses = await req.app.locals.db.query(
      `SELECT COUNT(DISTINCT ip_address) as count FROM login_attempts 
       WHERE timestamp > $1`,
      [twentyFourHoursAgo]
    );
    
    // Get recent failed logins
    const recentFailedLogins = await req.app.locals.db.query(
      `SELECT username, COUNT(*) as count, MAX(timestamp) as last_attempt 
       FROM login_attempts 
       WHERE success = false AND timestamp > $1 AND username IS NOT NULL
       GROUP BY username 
       ORDER BY count DESC 
       LIMIT 5`,
      [twentyFourHoursAgo]
    );
    
    res.json({
      totalEvents,
      highSeverity,
      unresolvedEvents,
      loginFailures: parseInt(loginFailures.rows[0].count),
      ipAddressCount: parseInt(ipAddresses.rows[0].count),
      recentFailedLogins: recentFailedLogins.rows.map(row => ({
        username: row.username,
        count: parseInt(row.count),
        lastAttempt: row.last_attempt
      }))
    });
  } catch (error) {
    console.error('Error fetching security statistics:', error);
    res.status(500).json({ message: 'Failed to fetch security statistics' });
  }
});

// Resolve a security audit log
router.post('/audit-logs/:id/resolve', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const logId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    const success = await securityService.resolveAuditLog(logId, userId);
    
    if (!success) {
      return res.status(404).json({ message: 'Audit log not found or already resolved' });
    }
    
    res.json({ success: true, message: 'Audit log resolved successfully' });
  } catch (error) {
    console.error('Error resolving security audit log:', error);
    res.status(500).json({ message: 'Failed to resolve security audit log' });
  }
});

// Get login attempts
router.get('/login-attempts', isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Default to last 24 hours if not specified
    const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);
    
    const result = await req.app.locals.db.query(
      `SELECT 
         username, 
         ip_address, 
         user_agent, 
         success, 
         timestamp,
         attempt_count
       FROM login_attempts 
       WHERE timestamp > $1
       ORDER BY timestamp DESC
       LIMIT 100`,
      [startTime]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching login attempts:', error);
    res.status(500).json({ message: 'Failed to fetch login attempts' });
  }
});

// Clear login attempts for an IP address
router.delete('/login-attempts', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { ipAddress, username } = req.body;
    
    if (!ipAddress) {
      return res.status(400).json({ message: 'IP address is required' });
    }
    
    await securityService.clearLoginAttempts(ipAddress, username);
    
    // Log this action in the security audit
    if (req.user) {
      await securityService.createAuditLog(
        req.user.id,
        'CLEAR_LOGIN_ATTEMPTS',
        securityService.getClientIp(req),
        {
          clearedIp: ipAddress,
          clearedUsername: username || 'all users'
        },
        'MEDIUM'
      );
    }
    
    res.json({ success: true, message: 'Login attempts cleared successfully' });
  } catch (error) {
    console.error('Error clearing login attempts:', error);
    res.status(500).json({ message: 'Failed to clear login attempts' });
  }
});

export default router; 