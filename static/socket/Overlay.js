;(function(global){
    if(!global) {
        return;
    }

    // add overlay
    var overlay = document.createElement('div');
    overlay.style.cssText = 'display: none; position:absolute; left: 0; right: 0; top: 0; bottom: 0; padding: 15px;'
                          + 'opacity: 0.85; z-index: 9999999; line-height: 20px; word-wrap: break-word; overflow: auto;'
                          + 'font-size:14px; background-color:#000; color:#aaa;';
    overlay.style.fontFamily = 'Lucida Console, Lucida Sans Typewriter, monaco, Bitstream Vera Sans Mono, monospace';
    document.body.appendChild(overlay);

    // handle error event
    var socket = io('', {reconnection: false});
    var assets = {};
    socket.on('testAppID', function(assetEntrys) {
        var fragment = document.createDocumentFragment();
        var needRefreshment = false;

        Object.keys(assetEntrys).map(function(assetName) {
            var assetItem = assetEntrys[assetName];

            // 验证 asset 是不是属于自己
            if(global._ykit_assets.indexOf(assetName) === -1) {
                return
            }

            // 检查是否需要更新 asset 的 error 信息
            if(!assets[assetName] || (assets[assetName].compilationId !== assetItem.compilationId)) {
                assets[assetName] = assetItem;
                needRefreshment = true;
            }
        });

        if(needRefreshment) {
            overlay.innerHTML = '';
            Object.keys(assets).map(function(assetName) {
                var assetItem = assets[assetName];

                assetItem.errors && assetItem.errors.map(function(err) {

                    // err item
                    var errorEle = document.createElement('p');
                    errorEle.style.cssText = 'margin: 0px 0 10px; padding: 0;'

                    // err item-label
                    var errorLabelEle = document.createElement('span');
                    errorLabelEle.innerText = 'Error';
                    errorLabelEle.style.cssText = 'padding: 1px 4px; margin: 0 8px 0 0;'
                                                + 'background-color: #e33; color: #eee; border-radius: 2px;';
                    errorEle.appendChild(errorLabelEle);

                    // err item-err info
                    var errorContentEle = document.createElement('span');
                    errorContentEle.innerText = err;
                    errorContentEle.style.cssText = "user-select: initial";
                    errorEle.appendChild(errorContentEle);

                    // append err item
                    fragment.appendChild(errorEle);
                });
            });

            // 添加按钮
            var btnStyle = 'position: absolute; z-index:99999999; bottom: 70px; right: 15px; width: 100px; opacity: 0.9;'
                          + 'padding: 10px 0; font-size: 14px; border: 1px solid #ccc; border-radius: 3px;'
                          + 'background-color: transparent; color: #eee; cursor: pointer;';

            var btnReload = document.createElement('button');
            btnReload.innerText = 'Reload';
            btnReload.style.cssText = btnStyle + 'bottom: 15px; background-color: #09c;';
            btnReload.onclick = function(){location.reload()}

            var btnDismiss = document.createElement('button');
            btnDismiss.innerText = 'Dismiss';
            btnDismiss.style.cssText = btnStyle + 'bottom: 65px; background-color: transparent;';
            btnDismiss.onclick = function(){
                overlay.style.display = 'none';
                btnReload.style.display = 'none';
                btnDismiss.style.display = 'none';
            }

            if(fragment.children.length > 0) {
                overlay.style.display = 'block';
                document.body.appendChild(btnDismiss);
                document.body.appendChild(btnReload);
            } else {
                // 提示进行 reload
                var doneLabelEle = document.createElement('span');
                doneLabelEle.innerText = 'Done';
                doneLabelEle.style.cssText = 'padding: 1px 4px; margin: 0 8px 0 0;'
                                            + 'background-color: #089608; color: #eee; border-radius: 2px;';
                fragment.appendChild(doneLabelEle);

                var doneTextEle = document.createElement('span');
                doneTextEle.innerText = 'Compiled successfully. Please reload the page.';
                fragment.appendChild(doneTextEle);
            }

            // 整合进蒙层
            overlay.appendChild(fragment);
        }
    });
})(window);
