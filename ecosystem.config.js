module.exports = {
  apps: [{
    name: 'app4',
    script: 'pnpm',
    args: 'start',
    cwd: '/home/ubuntu/app4',
    interpreter: 'bash',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
