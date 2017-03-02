'use strict';

import React from 'react'
import ReactDOM from 'react-dom'

var HelloMessage = React.createClass({
    render: function() {
        console.log('render HelloMessage');
        return (
            <div className="wrapper">
                <h1>Hello {this.props.name}</h1>
                <a href="ued.qunar.com/ykit/" target="_blank">
                    See for document here.
                </a>
            </div>
        )
    }
});

ReactDOM.render(<HelloMessage name="Ykit-Seed-React" />, document.getElementById('app'));
