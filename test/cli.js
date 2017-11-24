'use strict';

const path = require('path');
const shell = require('shelljs');
const expect = require('chai').expect;

const ykitPath = path.join(__dirname, '../bin/ykit');
const kill = require('../src/utils/psKill');

const cwd = process.cwd();
const exampleName = 'ykit-starter-react';
const examplePath = path.join(cwd, 'cli-test', exampleName);

describe('Start testing terminal client', () => {
    const env = process.env.ENV;

    beforeEach(function() {
        shell.cd(cwd);
        if (!shell.test('-d', path.join(cwd, 'cli-test'))) {
            shell.mkdir('-p', path.join(cwd, 'cli-test'));
        }
        shell.cd(path.join(cwd, 'cli-test'));
    });

    after(function() {
        if (shell.test('-d', path.join(cwd, 'cli-test'))) {
            shell.rm('-rf', path.join(cwd, 'cli-test'));
        }
    });

    it('clone example project & install dependencies', () => {
        // install
        const gitUrl = 'https://github.com/roscoe054/' + exampleName + '.git';
        shell.cd(path.join(cwd, 'cli-test'));
        shell.exec('git clone ' + gitUrl + ' ' + exampleName);
        shell.cd(examplePath);

        let output;
        if(env === 'local') {
            output = shell.exec('yarn', {silent: true});
        } else {
            output = shell.exec('yarn', {silent: false});
        }

        if (output.code !== 0) {
            process.exit(1);
        }
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

    it('runs server command without config file', (done) => {
        shell.cd(path.join(examplePath, 'node_modules'));

        const child = shell.exec(ykitPath + ' server -p 3000', {silent: true}, () => {
            // do nothing & wait for curl
        });

        let serverStarted = false
        child.stdout.on('data', (data) => {
            if (data.includes('Starting up server')) {
                serverStarted = true
                shell.exec('sleep 3');

                const output = shell.exec('curl -I localhost:3000/react/react.js', {silent: true});
                expect(output.includes('200')).to.be.true;

                kill(child.pid);
                done(0);
            } else if(!serverStarted) {
                done('Server fails to start');
            }
        });
    })

    it('runs pack command', () => {
        shell.cd(examplePath);

        shell.exec(ykitPath + ' pack -m', {silent: false});
        expect(shell.test('-d', path.join(examplePath, 'prd'))).to.be.true;
    })

})
