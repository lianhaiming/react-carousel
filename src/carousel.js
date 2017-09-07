import React, {Component} from 'react'
import { PropTypes } from 'prop-types'
import _ from 'lodash'
import tweenFunctions from 'tween-functions'
import requestAnimationFrame from 'raf'
const FPS = 60
const UPDATE_TIME = 1000 /FPS
const THRESHOLD_P = 0.1
const RESET_TIME = 0.5
// UI组件
const Container = ({innerRef,children}) => {
  return (
    <div style={{
      width: '100%',
      heigth: 'auto',
      overflow: 'hidden'
    }} ref={innerRef}>
      {children}
    </div>
  )
}

const Fram = ({width,children}) => {
  return (
    <div style={{
      width: `${width}px`,
      padding: 0,
      margin: 0,
      // WebkitOverflowScrolling: 'touch',
      overflow: 'hidden'
    }}>
    {children}
    </div>
  )
}

const SliderList = ({ width,count,children,transLateX }) => {

  return (
    <div style={{
      width: `${width*count}px`,
      position: 'relative',
      transform: `translateX(${transLateX}px)`
    }}> 
      {children}
    </div>
  )
}

const SliderItem = ({width,
  children,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onMouseDown,
  onMouseMove
  }) => {
  return (
    <div style={{
      float: 'left',
      width: `${width}px`,
      height: 'auto',
      padding: 0,
      margin: 0,
      boxSizing: 'border-box',
      color: '#fff'
    }} 
      onTouchStart={onTouchStart}
      onTouchMove = {onTouchMove}
      // onMouseDown = {onMouseDown}
      // onMouseMove = {onMouseMove}
      onTouchEnd = {onTouchEnd}
    >
    {children}
    </div>
  )
}
class Carousel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      currentIndex:1,
      transLateX: 0,
      startPosition: 0,
      deltalx: 0,
      direction: '',
    };
  }

  render() {
    const {children} = this.props;
    const lastItem = _.last(children);
    const firstItem = _.first(children);
    const {width,transLateX }= this.state;
    const count = children.length + 2;
    return (
        <Container innerRef= {(node) => { this.container = node } }> 
          <Fram> 
            <SliderList width={width} 
                        count={count} 
                        transLateX = {transLateX}
                        > 
              <SliderItem width={width}> 
                {lastItem}
              </SliderItem>
                {_.map(children, (item, index) => 
                   (<SliderItem 
                    width={width} 
                    key={index}
                    onTouchStart={this.handleTouchStart}
                    onTouchMove = {this.handleTouchMove}
                    onMouseDown = {this.handleTouchStart}
                    onMouseMove = {this.handleTouchMove}
                    onTouchEnd = {this.handleTouchEnd}
                    >
                    {item}
                    </SliderItem>)
                )}
              <SliderItem width={width}>
                {firstItem}
              </SliderItem>
            </SliderList>
          </Fram>
        </Container>
    );
  }
  componentDidMount() {
    this.getContainerWidth();
  }
  componentWillUnmount() {
    requestAnimationFrame.cancel(this.rafId)
  }
  getContainerWidth = () => {
    const width = _.get(this.container.getBoundingClientRect(), 'width');
    this.setState({
      width,
      transLateX: -width*this.state.currentIndex
    })
  }
  getPosition = (e) => {
    // 判断是否在移动端
    if(!_.isNil(_.get(e,'touches'))) {
      const {pageX,pageY} = _.head(e.touches)
      return {
        x:pageX,
        y:pageY
      }
    } else {
      const {clientX,clientY} = e;
      return {
        x:clientX,
        y:clientY
      }
    }
  }

  handleTouchStart = (e) => {
    const { x } = this.getPosition(e)
    this.setState({
      startPosition: x
    })
    
  }
  handleTouchMove = (e) => {
    const {x} = this.getPosition(e)
    const {width,currentIndex} = this.state
    const deltalx = x - this.state.startPosition
    const direction = deltalx > 0 ? 'right' : 'left'
    this.setState({
      moveDeltalx:deltalx,
      direction,
      transLateX: -(width*currentIndex) + deltalx,
    })
    
  }
  handleTouchEnd = (e) => {
     const {moveDeltalx,width} = this.state
     const moveNext = Math.abs(moveDeltalx) > width*THRESHOLD_P
     if (moveNext) {
        this.handleSwipe()
     } else {
        this.handleReset()
     }
  }
   handleSwipe = () => {
    const {moveDeltalx, width, currentIndex, direction} = this.state
    const {speed} = this.props
    const beginValue = -(width*currentIndex) + moveDeltalx;
    const newIndex = moveDeltalx < 0 ? (currentIndex + 1) : (currentIndex -1)
    const endValue = -(width*newIndex)
    const tweenQueue  = this.getTweenQueue(beginValue, endValue, speed)
    
    this.animation(tweenQueue, newIndex)
    
  }
  handleReset = () => {
    const {speed} = this.props
    const {width, currentIndex, moveDeltalx} = this.state
    const beginValue = -(width*currentIndex) + moveDeltalx;
    const endValue = -(width*currentIndex)
    const tweenQueue  = this.getTweenQueue(beginValue, endValue, speed*RESET_TIME)
    
    this.animation(tweenQueue, currentIndex)
  }

  getTweenQueue = (beginValue, endValue, speed) => {
    const tweenQueue = [];
    let updateTimes = speed / UPDATE_TIME

      for(let i = 0; i < updateTimes; i++) {
        tweenQueue.push(tweenFunctions.easeInQuad(UPDATE_TIME * i, beginValue, endValue, speed))
      }
      return tweenQueue
  } 
  animation = (tweenQueue, newIndex) => {
    if(_.isEmpty(tweenQueue)) {
      this.handleOprationEnd(newIndex)
      return
    }
    this.setState({
      transLateX: _.head(tweenQueue)
    })
    tweenQueue.shift()
    this.rafId= requestAnimationFrame(()=> {
      this.animation(tweenQueue, newIndex)
    })
  }
  handleOprationEnd = (newIndex) => {
    if(newIndex >3) {
      newIndex = 1
    }
    if (newIndex < 1) {
      newIndex = 3
    }
    const {width} = this.state
    this.setState({
      currentIndex: newIndex,
      transLateX: -(width*newIndex),
      startPosition: 0,
      deltalx: 0,
      direction: '',
    })
  }
}

export default Carousel