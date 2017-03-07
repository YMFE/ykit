'use strict';

const path = require('path');
const shell = require('shelljs');
const expect = require('chai').expect;

const pkgJsonPath = path.join(__dirname, './pkg.json');
const ykitPath = path.join(__dirname, '../bin/ykit');
const kill = require('../src/utils/psKill');

const cwd = process.cwd();
const exampleName = 'ykit-seed-react'
const examplePath = path.join(cwd, 'cli-test', exampleName)

describe('Ykit CLI', () => {

    beforeEach(function() {
        if (shell.test('-d', 'cli-test')) {
            shell.cd('cli-test');
        } else {
            shell.mkdir('-p', 'cli-test');
        }
    });

    afterEach(function() {
        shell.cd(cwd);
    });

    after(function() {
        if (shell.test('-d', 'cli-test')) {
            shell.rm('-rf', 'cli-test');
        }
    });

    it('clone example project', () => {
        // install
        shell.cp('-R', path.join(cwd, 'examples', exampleName), path.join(cwd, 'cli-test'));
        console.log('cp finish');
        shell.cd(examplePath);
        console.log('cd finish');

        const output = shell.exec('yarn install --registry https://registry.npmjs.org/', {silent: true});
        console.log('yarn install finish', output.code);
        if (output.code !== 0) {
            process.exit(1);
        }
        console.log('yarn test');
        expect(shell.test('-d', 'node_modules')).to.be.true;
    })

    it('runs server command', (done) => {
        const child = shell.exec(ykitPath + ' server -p 3000', {silent: true}, () => {
            // do nothing & wait for curl
        });

        let serverStarted = false
        child.stdout.on('data', (data) => {
            if (data.includes('Starting up server')) {
                serverStarted = true
                shell.exec('sleep 3');

                const output = shell.exec('curl -I localhost:3000', {silent: true});
                expect(output.includes('200')).to.be.true;

                kill(child.pid);
                done(0);
            } else if(!serverStarted){
                done('Server fails to start');
            }
        });
    })

    it('runs pack command', () => {
        shell.cd(examplePath);

        shell.exec(ykitPath + ' pack -m', {silent: true});

        expect(shell.test('-d', path.join(examplePath, 'prd'))).to.be.true;
    })

    it('runs lint command', () => {
        shell.cd(examplePath);

        const output = shell.exec(ykitPath + ' lint', {silent: true});
        expect(output.stdout.includes('1 error, 0 warnings')).to.be.true;
    })

})
