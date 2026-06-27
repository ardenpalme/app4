#!/bin/zsh
tar czf deploy.tar.gz --directory .next/standalone .
scp -r -i "~/private/Web Server 5.pem" deploy.tar.gz  ubuntu@ec2-34-248-10-206.eu-west-1.compute.amazonaws.com:~/deploy
scp -r -i "~/private/Web Server 5.pem" .next/static  ubuntu@ec2-34-248-10-206.eu-west-1.compute.amazonaws.com:~/deploy/.next/
scp -r -i "~/private/Web Server 5.pem" public  ubuntu@ec2-34-248-10-206.eu-west-1.compute.amazonaws.com:~/deploy
rm deploy.tar.gz 
