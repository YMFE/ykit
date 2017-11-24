'use strict';

const path = require('path');
const shell = require('shelljs');
const child_process = require('child_process');
const expect = require('chai').expect;

const ykitBin = path.join(__dirname, '../bin/ykit');
const cwd = process.cwd();
const exampleName = 'ykit-starter-react';
const examplePath = path.join(cwd, 'cli-test', exampleName);

const port = 3306;
const kill = function() {
    // 防止端口已被用
    try {
        shell.exec(`kill $(lsof -t -i:${port})`, {silent: true});
    } catch (e) {
        // do nothing
    }
}

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
            console.log('err', output);
            process.exit(1);
        }
        expect(shell.test('-d', 'node_modules')).to.be.true;
    })

    it('runs server command', (done) => {
        shell.cd(examplePath);
        kill();

        const child = shell.exec(`${ykitBin} server -p ${port}`, {silent: true}, () => {
            // do nothing & wait for curl
        });

        shell.exec('sleep 2');
        let hasTestCurl = false;
        child.stdout.on('data', (data) => {
            if(hasTestCurl) {
                return;
            }
            hasTestCurl = true;

            const output = shell.exec(`curl -I localhost:${port}`, {silent: true});
            expect(output.includes('200')).to.be.true;

            kill();
            done(0);
        });
    })

    it('runs server command without config file', (done) => {
        shell.cd(path.join(examplePath, 'node_modules'));
        kill();

        const child = shell.exec(`${ykitBin} server -p ${port}`, {silent: true}, () => {
            // do nothing & wait for curl
        });

        shell.exec('sleep 2');
        let hasTestCurl = false;
        child.stdout.on('data', (data) => {
            if(hasTestCurl) {
                return;
            }
            hasTestCurl = true;

            const output = shell.exec(`curl -I localhost:${port}/react/react.js`, {silent: true});
            expect(output.includes('200')).to.be.true;

            kill();
            done(0);
        });
    })

    it('runs pack command', () => {
        shell.cd(examplePath);

        shell.exec(ykitBin + ' pack -m', {silent: true});
        expect(shell.test('-d', path.join(examplePath, 'prd'))).to.be.true;
    })
})
