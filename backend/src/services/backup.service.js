const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.ensureBackupDirectory();
    this.scheduleBackups();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(type = 'manual') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `hostel_backup_${type}_${timestamp}.gz`;
      const backupPath = path.join(this.backupDir, backupFileName);

      const dbName = process.env.DB_NAME || 'hostel_management';
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

      // Extract database name from URI if full URI is provided
      const dbNameFromUri = mongoUri.includes('/') ? mongoUri.split('/').pop().split('?')[0] : dbName;

      const command = `mongodump --uri="${mongoUri}" --db="${dbNameFromUri}" --archive="${backupPath}" --gzip`;

      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('Backup failed - MongoDB tools may not be installed:', error.message);
            // Return a mock backup info for development
            const mockBackupInfo = {
              filename: backupFileName,
              path: backupPath,
              size: 0,
              created: new Date(),
              type,
              status: 'failed - MongoDB tools not available'
            };
            resolve(mockBackupInfo);
            return;
          }

          const stats = fs.existsSync(backupPath) ? fs.statSync(backupPath) : { size: 0 };
          const backupInfo = {
            filename: backupFileName,
            path: backupPath,
            size: stats.size,
            created: new Date(),
            type,
            status: 'completed'
          };

          // Save backup info to log
          this.logBackup(backupInfo);

          console.log('Backup created successfully:', backupFileName);
          resolve(backupInfo);
        });
      });
    } catch (error) {
      console.error('Backup creation error:', error);
      throw error;
    }
  }

  async restoreBackup(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      const dbName = process.env.DB_NAME || 'hostel_management';
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

      // Extract database name from URI if full URI is provided
      const dbNameFromUri = mongoUri.includes('/') ? mongoUri.split('/').pop().split('?')[0] : dbName;

      const command = `mongorestore --uri="${mongoUri}" --db="${dbNameFromUri}" --archive="${backupPath}" --gzip --drop`;

      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('Restore failed:', error);
            reject(error);
            return;
          }

          console.log('Database restored successfully from:', backupFileName);
          resolve({ success: true, message: 'Database restored successfully' });
        });
      });
    } catch (error) {
      console.error('Restore error:', error);
      throw error;
    }
  }

  async getBackupList() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.gz')) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          
          backups.push({
            filename: file,
            size: stats.size,
            created: stats.mtime,
            sizeFormatted: this.formatFileSize(stats.size)
          });
        }
      }

      return backups.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('Error getting backup list:', error);
      return [];
    }
  }

  async deleteBackup(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      fs.unlinkSync(backupPath);
      console.log('Backup deleted:', backupFileName);
      
      return { success: true, message: 'Backup deleted successfully' };
    } catch (error) {
      console.error('Delete backup error:', error);
      throw error;
    }
  }

  async cleanupOldBackups(retentionDays = 30) {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = Date.now();
      const retentionPeriod = retentionDays * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        if (file.endsWith('.gz')) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          
          if (now - stats.mtime.getTime() > retentionPeriod) {
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log('Deleted old backup:', file);
          }
        }
      }

      return { deletedCount, message: `Cleaned up ${deletedCount} old backups` };
    } catch (error) {
      console.error('Cleanup error:', error);
      throw error;
    }
  }

  scheduleBackups() {
    // Only schedule backups in production or if explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_BACKUP_CRON === 'true') {
      // Daily backup at 2 AM
      cron.schedule('0 2 * * *', async () => {
        try {
          console.log('Starting scheduled daily backup...');
          await this.createBackup('daily');
          await this.cleanupOldBackups(30); // Keep 30 days of backups
        } catch (error) {
          console.error('Scheduled backup failed:', error);
        }
      });

      // Weekly backup on Sunday at 3 AM
      cron.schedule('0 3 * * 0', async () => {
        try {
          console.log('Starting scheduled weekly backup...');
          await this.createBackup('weekly');
        } catch (error) {
          console.error('Scheduled weekly backup failed:', error);
        }
      });

      console.log('Backup schedules initialized');
    } else {
      console.log('Backup scheduling disabled in development mode');
    }
  }

  logBackup(backupInfo) {
    try {
      const logPath = path.join(this.backupDir, 'backup_log.json');
      let logs = [];

      if (fs.existsSync(logPath)) {
        const logData = fs.readFileSync(logPath, 'utf8');
        logs = JSON.parse(logData);
      }

      logs.push(backupInfo);

      // Keep only last 100 log entries
      if (logs.length > 100) {
        logs = logs.slice(-100);
      }

      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Error logging backup:', error);
    }
  }

  getBackupLogs() {
    try {
      const logPath = path.join(this.backupDir, 'backup_log.json');
      
      if (!fs.existsSync(logPath)) {
        return [];
      }

      const logData = fs.readFileSync(logPath, 'utf8');
      return JSON.parse(logData);
    } catch (error) {
      console.error('Error reading backup logs:', error);
      return [];
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async getBackupStatus() {
    try {
      const backups = await this.getBackupList();
      const logs = this.getBackupLogs();
      
      const lastBackup = backups.length > 0 ? backups[0] : null;
      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
      
      return {
        totalBackups: backups.length,
        totalSize: this.formatFileSize(totalSize),
        lastBackup: lastBackup ? {
          filename: lastBackup.filename,
          created: lastBackup.created,
          size: lastBackup.sizeFormatted
        } : null,
        recentLogs: logs.slice(-5).reverse()
      };
    } catch (error) {
      console.error('Error getting backup status:', error);
      return null;
    }
  }
}

module.exports = new BackupService();