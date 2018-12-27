# node-red-contrib-oauth2

A wrapper for [Simple OAuth2](http://lelylan.github.io/simple-oauth2/) client library.

# Purpose

This node is intended to be used for communicating with OAuth2 protected APIs. Once you configured it,
for each incoming message the node will emit a message containing the <code>msg.payload.accessToken</code>
value which can be passed to other nodes sending messages to an OAuth protected API.

# Installation

## Manual installation

- In case of manual installation copy the code to the user directory of Node-RED e.g. `/data/node_modules/node-red-contrib-oauth2`.
- Install the dependencies via `npm install` and move packages one level up `mv node_modules/* ..`.
- To make Node-RED find the code, define the NODE_PATH environment variable by adding the
Node-RED installation directory first, and the user directory second. Here is an example: `NODE_PATH="/usr/src/node-red/node_modules:/data/node_modules"`

# Unit tests

To run unit tests run `npm test` from the command line.

# Known issues

- Node cannot start authentication from a subflow, therefore obtain the initial access token.
