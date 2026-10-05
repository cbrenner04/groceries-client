#!/bin/bash

set -e

aws s3 sync build/ s3://$GROCERIES_PROD_BUCKET
aws s3 cp build/.well-known/apple-app-site-association \
  "s3://$GROCERIES_PROD_BUCKET/.well-known/apple-app-site-association" --content-type application/json
aws cloudfront create-invalidation --distribution-id $GROCERIES_PROD_DISTRO_ID --paths "/*"
