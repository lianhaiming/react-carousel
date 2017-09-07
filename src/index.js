import React, { Component } from 'react';
import { render } from 'react-dom';
import Carousel from './carousel'
class App extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const data = [{
      color: 'green',
      name: 'Carousel01'
    },{
      color: 'blue',
      name: 'Carousel02'
    },{
      color: 'yellow',
      name: 'Carousel03'
    }]
    return (
      <Carousel speed="500">
        {_.map(data, (c, i) => 
            ( <div style={{
           height: '10em',
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center',
           background: c.color
           
         }} key={c.color}> {c.name}</div>)
        )
         
        }
      </Carousel>
    )
  }
}
render(<App />, document.getElementById('root'));
