'use strict';

const path = require('path');
const shell = require('shelljs');
const expect = require('chai').expect;

const pkgJsonPath = path.join(__dirname, './pkg.json');
const ykitPath = path.join(__dirname, '../bin/ykit');
const kill = require('../src/utils/psKill');

describe('YKIT CLI', () => {
    it('installs ykit', () => {
        if (shell.test('-d', 'cli-test')) {
            shell.rm('-rf', 'cli-test');
        }

        shell.mkdir('cli-test');
        shell.cd('cli-test');
        shell.cp(pkgJsonPath, 'package.json');
        const output = shell.exec('npm install --registry http://registry.npm.corp.qunar.com/');
        if (output.code !== 0) {
            process.exit();
        }

        expect(shell.test('-f', 'package.json')).to.be.true;
        expect(shell.test('-d', 'node_modules')).to.be.true;
    })

    it('runs the pack command', () => {
        if (shell.test('-d', 'cli-test')) {
            shell.rm('-rf', 'cli-test');
        }

        // shell.mkdir('cli-test');
        shell.cd('cli-test');
        if (shell.exec('git clone http://gitlab.corp.qunar.com/yuhao.ju/ykit-seed-react.git').code !== 0) {
            process.exit();
        }

        shell.cd('ykit-seed-react');
        if (shell.exec('npm install --registry http://registry.npm.corp.qunar.com/').code !== 0) {
            process.exit();
        }

        if (shell.exec(ykitPath + ' pack').code !== 0) {
            process.exit();
        }

        expect(shell.test('-f', 'package.json')).to.be.true;
        expect(shell.test('-d', 'node_modules')).to.be.true;
    })

    it('runs the server command', (done) => {
        shell.cd('cli-test');
        const child = shell.exec(ykitPath + ' server -p 3000', () => {
            // do nothing & wait for curl
        });

        let serverStarted = false
        child.stdout.on('data', (data) => {
            if (data.includes('Starting up server')) {
                serverStarted = true
                shell.exec('sleep 3');

                const output = shell.exec('curl -I localhost:3000');
                expect(output.includes('200'));

                kill(child.pid);
                done(0);
            } else if(!serverStarted){
                done('Server fails to start');
            }
        });
    })
})
