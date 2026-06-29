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
* change @/lib/envConfig.ts to set the puppeteer_params_aws to null if running locally (refactored)

### TODO
* Understand the `ERR_BLOCKED_BY_CLIENT` error on AWS
* SSL secutiry for PostgreSQL queries
* Add more fields to edit for each position
* Place projects into database and add an editor for them too with a link field
* Config based on whether in prod environment or local environment
* Persist the cash and previously existing stocks, make an option to copy over last values to new values on sync database admin page
* Put Garden page behind a password
