## Personal Website
### Tech stack
* Next.js
* Prisma ORM via tRPC
* ShadCN front-end library

### Hosting
* AWS EC2 with Elastic IP
* Neon DB

### API's
* EODHD with U.S. Options (financial data 15-min delayed)
* Alchemy (Crypto) 

### Notes
* systemd service file should be in /etc/systemd/system/ibrk_cli_gw.service (unused)
* change @/lib/envConfig.ts to set the puppeteer_params_aws to null if running locally (refactored)

### TODO
* Understand the `ERR_BLOCKED_BY_CLIENT` error on AWS
* SSL secutiry for PostgreSQL queries
 
