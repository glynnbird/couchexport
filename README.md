# couchcsvexport 
## Introduction

The _couchcsvexport_ command-line utility is useful for exporting Apache CouchDB database to CSV format. Note:

- the documents must be uniform i.e. have the same number of attributes.
- "flat" JSON documents make for better CSV exports
- the first line of the CSV will be the column headers

## Installation

Install using npm or another Node.js package manager:

```sh
npm install -g couchcsvexport
```

## Usage

_couchcsvexport_  (or its alias _couchexport_) writes a CSV to stdout which can be redirected to a file:

```sh
couchexport --db mydatabase > mydatabase.csv
```

*couchexport*'s configuration parameters can be stored in environment variables or supplied as command line arguments.

## Configuration - environment variables

Simply set the `COUCH_URL` environment variable e.g. for a hosted Cloudant database

```sh
export COUCH_URL="https://myusername:myPassw0rd@myhost.cloudant.com"
```

and define the name of the CouchDB database to write to by setting the `COUCH_DATABASE` environment variable e.g.

```sh
export COUCH_DATABASE="mydatabase"
```

## Configuring - command-line options

Supply the `--url` and `--database` parameters as command-line parameters instead:

```sh
couchexport --url "http://user:password@localhost:5984" --database "mydata"
```

## IAM

To use IBM IAM authentication, use the `IAM_API_KEY` environment variable e.g.

```sh
export IAM_API_KEY="my_api_key"
export COUCH_URL="https://my.cloudant.com"
couchexport --db mydata
```
