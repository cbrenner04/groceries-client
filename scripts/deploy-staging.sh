#!/bin/bash

set -e

aws s3 sync build/ s3://$GROCERIES_STAGING_BUCKET
aws cloudfront create-invalidation --distribution-id $GROCERIES_STAGING_DISTRO_ID --paths "/*"
