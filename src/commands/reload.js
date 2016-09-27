'use strict';

const Manager = require('../modules/manager.js')
const child_process = require('child_process')
const requireg = require('requireg')
const request = require('request')
const semver = require('semver')

exports.usage = "重载插件"

exports.setOptions = (optimist) => {
    optimist.alias('s', 'service')
    optimist.describe('s', '拉取插件服务地址')
};

exports.run = (options) => {
    const servicePath = options.s || options.service || 'http://l-uedmobile0.h.dev.cn0.qunar.com:3000/download'

    // 重载全局插件
    Manager.reloadRC();

    // 检查devDependencies中的ykit-config-{name}
    const packageJsonContent = JSON.parse(fs.readFileSync('./package.json', {encoding: 'utf-8'}))
    const ykitModuleReg = /^(@[^\/]+\/)(ykit\-(\w+)\-[\w\-]+)$/

    let willInstallPackages = []

    if(packageJsonContent.devDependencies) {
        const devDependencies = packageJsonContent.devDependencies
        Object.keys(devDependencies).map((depName, i) => {
            if(ykitModuleReg.test(depName) && !requireg.resolve(depName)) {
                const version = devDependencies[depName]
                const packagePath = './node_modules/@qnpm'

                if(semver.valid(version)) {
                    // 确保存在@qnpm目录
                    mkdirp.sync(packagePath)

                    // 下载
                    const tarName = depName + '@' + version + '.tar.gz'
                    const extractPath = sysPath.join(process.cwd(), './node_modules/', tarName)
                    const downloadPath = servicePath + '/' + tarName
                    const downloadStream = request(downloadPath)
                        .on('response', function(response) {
                            log(`[${response.statusCode}] downloading ${downloadPath}`)
                         })
                        .pipe(fs.createWriteStream(extractPath))

                    // 解压
                    downloadStream.on('finish', (e) => {
                        if(e) {
                            return error(e)
                        }

                        log('extracting ' + extractPath)
                        child_process.exec('cd ./node_modules/@qnpm/ && tar -xf ' + extractPath, (e, stdout, errout) => {
                            if(e) {
                                return error(e)
                            }

                            success('complete!')
                            fs.unlinkSync(extractPath)
                        })
                    })
                } else {
                    error(depName + '版本号必须确定，如0.1.0')
                }
            }
        })
    }
};
