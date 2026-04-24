/**
 * PM2 配置文件
 *
 * 使用方式:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 *
 * 常用命令:
 *   pm2 status          查看服务状态
 *   pm2 logs repair-dispatch  查看日志
 *   pm2 restart repair-dispatch  重启服务
 *   pm2 stop repair-dispatch     停止服务
 */

module.exports = {
  apps: [
    {
      name: 'repair-dispatch',
      script: './app.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      // 自动重启
      autorestart: true,
      // 崩溃后重启延迟
      restart_delay: 3000,
      // 内存限制，超限时自动重启
      max_memory_restart: '512M',
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 8011,
        JWT_SECRET: 'repair-dispatch-secret-key-2026'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 8011,
        JWT_SECRET: 'repair-dispatch-dev-secret'
      },
      // 监控
      min_uptime: '10s',
      max_restarts: 5,
      // 不监听文件变化（生产环境）
      watch: false,
      // 忽略信号
      kill_timeout: 5000,
      listen_timeout: 10000
    }
  ]
};
