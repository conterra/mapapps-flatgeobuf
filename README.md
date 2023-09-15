# FlatGeobuf
⚠️ This bundle is no longer in active development.<br>
This bundle adds the support for FlatGeobuf layers to map.apps. It uses the library provided by FlatGeobuf.
More information: https://github.com/flatgeobuf/flatgeobuf

## Build Status
[![devnet-bundle-snapshot](https://github.com/conterra/mapapps-flatgeobuf/actions/workflows/devnet-bundle-snapshot.yml/badge.svg)](https://github.com/conterra/mapapps-flatgeobuf/actions/workflows/devnet-bundle-snapshot.yml)

## Sample App
https://demos.conterra.de/mapapps/resources/apps/downloads_flatgeobuf/index.html

## Installation Guide
⚠️**Requirement: map.apps 4.11.0**

[dn_flatgeobuf Documentation](https://github.com/conterra/mapapps-flatgeobuf/tree/master/src/main/js/bundles/dn_flatgeobuf)

## Development Guide
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
   `mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
   Change the mapapps.remote.base in the build.properties file and run:
   `mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
