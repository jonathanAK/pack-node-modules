#!/usr/bin/env node

const {exec} = require('child_process');
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')

const getRecursiveDependencies = (list) => {
    const mainDependencies = Object.keys(list);
    const result = mainDependencies.map(dep => `${dep}@${list[dep].version}`);
    mainDependencies.forEach(dep => {
        if (list[dep].dependencies) {
            result.push(...getRecursiveDependencies(list[dep].dependencies));
        }
    });
    return result;
};


const getPackageListFromLock = (packageLock, filter) => {
    const dependencies = getRecursiveDependencies(JSON.parse(packageLock).dependencies);
    const unique = [...new Set(dependencies)];
    if (!filter) return unique;
    const regex = new RegExp(filter, 'g');
    return unique.filter(dependence=>!dependence.match(regex));
};


async function packageDependencies(lisOfDependencies, target = 'tars') {
    exec(`mkdir ${target}`);
    try{
        const installedPackages = lisOfDependencies.map(dependence => asyncExec(`npm pack ${dependence} --pack-destination ./${target}`));
        const output = {
            fulfilled:[],
            rejected:[]
        };
        (await Promise.allSettled(installedPackages))
            .map(curr_package=>output[curr_package.status].push(curr_package.value));
        console.log('packed the following packages:\n',output.fulfilled);
        if(output.rejected.length){
            console.log('fail to pack the following packages:\n',output.rejected);
        }

    }catch(e){
        console.error(e);
    }
}

async function asyncExec(command) {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout) => {
            if (err) {
                return reject(err);
            }
            resolve(stdout);
        });
    });
}

async function main(argv) {
    const path = argv.path ? `${argv.path}/` : ''
    const lockFlag = argv['use-installed'] ? '' : '--package-lock-only';
    let packageLock;
    try{
        packageLock = await asyncExec(`npm ls ${path} --all ${lockFlag} --json`);
    }catch{
        await asyncExec(`npm i --package-lock-only --no-audit --force`);
        packageLock = await asyncExec(`npm ls ${path} --all ${lockFlag} --json`);
    }
    const packageList = getPackageListFromLock(packageLock, argv.filter);
    packageDependencies(packageList, argv.target);
}

yargs(hideBin(process.argv))
    .command('$0', 'pack all dependencies for project', (yargs) => {
        return yargs
    }, main)
    .option('target', {
        alias: 't',
        type: 'string',
        description: 'target folder for tars'
    }).option('use-installed', {
        alias: 'i',
        type: 'boolean',
        description: 'will use installed packages from node modules instead of package-lock.json file.'
    }).option('filter', {
    alias: 'f',
    type: 'string',
    description: 'use regex to filter out unwanted packages. for example: \nnpx pack-modules -f ^@mock\\/\n will remove packages starting with @mock/'
})
    .parse()
