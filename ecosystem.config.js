module.exports = {
  apps: [
    {
      name: 'dinner-awards-night',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: process.cwd(), // Automatically uses current directory
      instances: 2, // Number of instances (or 'max' for all CPU cores)
      exec_mode: 'cluster', // Enable cluster mode for load balancing
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env.production', // Use .env.production if it exists, otherwise .env.local
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs', '.git'],
    },
  ],
};

