#!/usr/bin/env bash

# abort if MCDIR not set and non-empty
if [ -z "$MCDIR" ]; then
    echo "MCDIR must be set to a non-empty string"
    exit 1
fi

echo "Clearing $MCDIR with:"
echo "rm -r $MCDIR/*"

rm -r $MCDIR/*