#!/bin/bash

set -e

aws cloudfront get-invalidation --distribution-id $GROCERIES_STAGING_DISTRO_ID --id $1
