'use strict'

const CLIEngine = require("eslint").CLIEngine
const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')

const Project = require('../models/Project.js')
const manager = require('../modules/manager.js')

exports.usage = "代码质量检测"

exports.setOptions = (optimist) => {
    optimist.alias('i', 'init')
    optimist.describe('i', '初始化eslint配置')
}

exports.run = (options) => {
	const configModules = manager.getModule('config')

	if(options.i || options.init) {
		initConfig()
		return
	}

	// check .eslintrc.*
	const esconfigs = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yaml', '.eslintrc']
	let promises = esconfigs.map((esconfig) => {
		let promise = new Promise((resolve, reject) => {
			fs.stat(esconfig, (err, result) => {
				typeof result !== 'undefined' ? resolve(esconfig) : resolve(null)
			})
		})
		return promise
	})

	Promise.all(promises).then((esconfigs) => {
		let findConfig = esconfigs.some((esconfig) => {
			if(esconfig){
				let cli = new CLIEngine({
					configFile: path.resolve(options.cwd, esconfig),
				})

				let report = cli.executeOnFiles(['src/'])

				let formatter = cli.getFormatter()
				console.log(formatter(report.results))
				console.log('Finished')

				return true
			}
		})

		if(!findConfig){
			 initConfig()
		}
    })

	function initConfig() {
		const eslintPath = path.join(__dirname, '../../node_modules/eslint/bin/eslint.js')
		let choices = {
			basic: {
				"extends": "eslint:recommended",
				"env": {},
				"globals": {},
				"rules": {}
			}
		}

		configModules.map((configModule) => {
			const module = configModule.module
			if(module && module.eslintConfig){
				choices[configModule.name] = module.eslintConfig
			}
		})

		// TODO set hy/rn eslintConfig
		let question = {
			type: 'list',
			name: 'configType',
			message: 'Which style guide do you want to follow?',
			choices: Object.keys(choices)
		}
		inquirer.prompt([question]).then(function(answers) {
			console.log(answers.configType)

			const configContent = JSON.stringify(choices[answers.configType], null, '	')

			fs.writeFile('.eslintrc.json', configContent, function (err) {
			  if (err) return console.log(err)
			  console.log('Successfully created .eslintrc.json file in ' + options.cwd)
			})
		})
	}
}
