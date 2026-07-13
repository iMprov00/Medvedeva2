module.exports = {
  apps: [
    {
      name: 'medvedeva-api',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '127.0.0.1',
        DATABASE_PATH: '/var/www/medvedeva/db/production.sqlite3',
      },
    },
  ],
};
