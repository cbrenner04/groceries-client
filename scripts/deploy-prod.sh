#!/bin/bash

set -e

aws s3 sync build/ s3://$GROCERIES_PROD_BUCKET
aws cloudfront create-invalidation  --distribution-id $GROCERIES_PROD_DISTRO_ID --paths "/*"
