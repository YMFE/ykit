;(function(global){
    if(!global) {
        return;
    }

    var compilingAsset = '@COMPILING_ASSET';

    if(global._ykit_assets) {
        global._ykit_assets.push(compilingAsset);
    } else {
        global._ykit_assets = [compilingAsset];
    }

    if(!global.socketIO) {
        var socketIO = global.socketIO = document.createElement('script');
        socketIO.src = '/socket.io/socket.io.js';
        document.body.appendChild(socketIO);

        socketIO.onload = function() {
            var socketClient = document.createElement('script');
            socketClient.innerHTML = '@OVERLAY_SCRIPT';
            document.body.appendChild(socketClient);
        }
    }
})(window);
