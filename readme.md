# Pack Node Modules
\* Requires npm version 7.18.0 or higher  

Used to export all packages and sub-packages of a node project.
This is based on the versions kept in the projects package-lock.json file.
Make sure both package.json and package-lock.json exist in your project.

## Running
Open a shell in the project you wish to pack and type:  
`
npx pack-node-modules
`  

When finished a new folder named `tars` will appear containing the relevant packages.

You can use the `--target` flag to specify a different target folder.

Use the `-i` flag use the currently installed node modules instead of the ones in the package-lock.json file. 


for more information use `packNodeModules --help`
