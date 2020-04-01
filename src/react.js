import React, { Component } from 'react';
import ReactDom from 'react-dom';
import _ from 'lodash';
import './style/index.less';

const obj = _.cloneDeep({})

class App extends Component {
    
    render() {
        return <div>
            hello word`1235
        </div>
    }
}

ReactDom.render(<App />, document.getElementById('app'));