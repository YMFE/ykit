'use strict';

const path = require('path');
const shell = require('shelljs');
const expect = require('chai').expect;

const ykitPath = path.join(__dirname, '../bin/ykit');
const kill = require('../src/utils/psKill');

const apps = [
    {
        name: 'react',
        entry: 'index.html'
    }, {
        name: 'vue',
        entry: 'index.html'
    },
    {
        name: 'yo',
        entry: 'src/html/index.html'
    }
];
const cwd = process.cwd();
const env = process.env.ENV;

describe(`Start testing apps`, () => {
    before(function() {
        if (shell.test('-d', 'cli-test')) {
            shell.cd('cli-test');
        } else {
            shell.mkdir('-p', 'cli-test');
            shell.cd('cli-test');
        }
    });

    after(function() {
        shell.cd(cwd);

        if (shell.test('-d', 'cli-test')) {
            if(env !== 'browser') {
                shell.rm('-rf', 'cli-test');
            } else if(process.platform !== 'win32') {
                shell.cd(path.join(cwd, 'cli-test'));

                const port = '3300';
                const child = shell.exec(ykitPath + ' server -p ' + port, {silent: false}, () => {
                    // do nothing
                });
                apps.map((appItem) => {
                    const appUrl = `http://localhost:${port}/ykit-starter-${appItem.name}/${appItem.entry}`;
                    shell.exec('sleep 2');
                    shell.echo('Opening ' + appUrl);
                    shell.exec(`/usr/bin/open -a '/Applications/Google Chrome.app' '${appUrl}'`);
                })
                shell.exec('sleep 60');
            }
        }
    });

    apps.map((appItem) => {
        const appName = appItem.name;
        describe(`\nStart testing ${appName} bundling`, () => {
            const gitName = 'ykit-starter-' + appName;
            const appPath = path.join(cwd, 'cli-test', gitName);

            afterEach(function() {
                shell.cd(path.join(cwd, 'cli-test'));
            });

            it('clone app & install dependencies', () => {
                // install
                if(!shell.test('-d', appPath)) {
                    const gitUrl = 'https://github.com/roscoe054/ykit-starter-' + appName + '.git';
                    shell.exec('git clone ' + gitUrl + ' ' + gitName);
                }

                shell.cd(appPath);

                if(!shell.test('-d', 'node_modules')) {
                    let output;
                    if(env === 'local') {
                        output = shell.exec('yarn', {silent: true});
                    } else {
                        output = shell.exec('yarn', {silent: false});
                    }

                    if (output.code !== 0) {
                        process.exit(1);
                    }
                }

                expect(shell.test('-d', 'node_modules')).to.be.true;
            });

            it('runs pack command', () => {
                shell.cd(appPath);
                if(!shell.test('-d', path.join(appPath, 'prd'))) {
                    shell.exec(ykitPath + ' pack -m', {silent: false});
                }
                expect(shell.test('-d', path.join(appPath, 'prd'))).to.be.true;
            });
        })
    });
});
