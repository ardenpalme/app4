## Personal Website
### Tech stack
* Next.js
* Prisma ORM via tRPC
* ShadCN front-end library

### Hosting
* AWS EC2 with Elastic IP
* Neon DB (PostgreSQL)

### API's
* EODHD (financial data 15-min delayed)
* Alchemy (Crypto) 

### Notes
* systemd service file should be in /etc/systemd/system/ibrk_cli_gw.service (unused)
* change @/lib/envConfig.ts to set the puppeteer_params_aws to null if running locally (refactored)

### TODO
* Understand the `ERR_BLOCKED_BY_CLIENT` error on AWS
* SSL secutiry for PostgreSQL queries
* Get all positions and trades for a strategy, then I can edit the fields, 
    then delete all positions remotely (cascade delete on trades)
    and create all new positions (remove UUID creation on PostgreSQL and generate it locally with nanoid() -> string)
    Then for each position fields add the trades (remove UUID creation on PostgreSQL and generate trade UUID locally) [Done]
* Remove all console.log's
* Add more fields to edit for each position
* Place projects into database and add an editor for them too with a link field
