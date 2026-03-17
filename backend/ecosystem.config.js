module.exports = {
  apps: [
    {
      name: "vh-backend",
      script: "./server.js",
      cwd: "/home/vh/VH_Management_IIITDMJ/backend",
      // Execution mode (cluster for multi-core systems)
      instances: "max",
      exec_mode: "cluster",
      // Environment variables
      env: {
        NODE_ENV: "production",
        PORT: 5000
      },
      // Watch and reload on file changes (optional, disable for production)
      watch: false,
      // Restart settings
      max_memory_restart: "500M",
      autorestart: true,
      // Error and output logs
      error_file: "/home/vh/VH_Management_IIITDMJ/backend/logs/error.log",
      out_file: "/home/vh/VH_Management_IIITDMJ/backend/logs/out.log",
      log_file: "/home/vh/VH_Management_IIITDMJ/backend/logs/combined.log",
      time: true,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Min uptime before auto restart counts
      min_uptime: "10s",
      // Max restarts
      max_restarts: 10,
      min_uptime_restart: "10s",
      // Cron restart (optional - restart daily at 3 AM)
      // cron_restart: "0 3 * * *"
    }
  ],

  // Deploy configuration (optional)
  deploy: {
    production: {
      user: "vh",
      host: "172.27.16.37",
      ref: "origin/main",
      repo: "git@github.com:yourusername/VH_Management_IIITDMJ.git",
      path: "/home/vh/VH_Management_IIITDMJ",
      "post-deploy": "cd backend && npm install && pm2 restart ecosystem.config.js --env production"
    }
  }
};
