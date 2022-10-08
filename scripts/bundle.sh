#!/bin/bash

echo "Bundle required files"
zip -r vtms-bundle.zip src .babelrc .eslint* .prettier* package.json tsconfig.json -x "*.DS_Store"