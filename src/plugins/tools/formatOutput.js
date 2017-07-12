'use strict';

var friendlySyntaxErrorLabel = 'Syntax error:';

function isLikelyASyntaxError(message) {
    return message.indexOf(friendlySyntaxErrorLabel) !== -1;
}

function formatMessage(message) {
    return message
    .replace(
      'Module build failed: SyntaxError:',
      friendlySyntaxErrorLabel
    )
    .replace(
      /Module not found: Error: Cannot resolve 'file' or 'directory'/,
      'Module not found:'
    )
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '')
    .replace('./~/css-loader!./~/postcss-loader!', '');
}

function lineJoin(arr) {
    var joined = arr.join('\n');
    return joined;
}

function formatOutput(stats) {
    var output = [];
    var hasErrors = stats.hasErrors();
    var hasWarnings = stats.hasWarnings();
    if (!hasErrors && !hasWarnings) {
        return lineJoin(output);
    }

    var json = stats.toJson();
    var formattedErrors = json.errors.map(function(message) {
        return 'in ' + formatMessage(message);
    });
    var formattedWarnings = json.warnings.map(function(message) {
        return 'in ' + formatMessage(message);
    });

    if (hasErrors) {
        if (formattedErrors.some(isLikelyASyntaxError)) {
            formattedErrors = formattedErrors.filter(isLikelyASyntaxError);
        }
        formattedErrors.forEach(function(message) {
            logError(message + '\n');
        });
        lineJoin(output);
    }

    if (hasWarnings) {
        formattedWarnings.forEach(function(message) {
            logWarn(message + '\n');
        });

        output.push('You may use special comments to disable some warnings.');
        output.push('Use eslint-disable-next-line to ignore the next line.');
        output.push('Use  eslint-disable  to ignore all warnings in a file.');

        lineJoin(output);
    }
}

module.exports = formatOutput;
