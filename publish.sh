#!/bin/sh
yarn install
yarn build
npm publish --verbose --access public --tag latest
