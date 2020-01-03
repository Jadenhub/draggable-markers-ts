import React from 'react';
import './layout.css';
import map from './map.png';
import icon from './marker.png';

interface LayoutState {
  markers: {coordinate: number[], key: string}[],
  clientpos:{x: number, y: number},
  isDragging: boolean,
  range: {
      maxY: number,
      maxX: number,
      minY: number,
      minX: number
  },
  target: string | undefined
}

interface LayoutProps {
  markerSize: {
      height: number,
      width: number
  }
}

export default class Layout extends React.Component<LayoutProps, LayoutState> {
  constructor(props: LayoutProps){
    super(props);
    this.state = {
      markers:[],
      clientpos: {
        x: 0,
        y: 0
      },
      isDragging: false,
      range:{
          maxX:0,
          maxY:0,
          minY:0,
          minX:0
      },
      target: undefined
    }
  }
  
  handleImgClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const markers = this.state.markers.slice();
    markers.push(
      {
        key : markers.length.toString(),
        coordinate : [e.nativeEvent.offsetY - this.props.markerSize.height/2, e.nativeEvent.offsetX - this.props.markerSize.width/2]
      }
    );
    this.setState({
      markers: markers,
      isDragging: false,
    });
  }
  
  handleDragStart = (e:React.MouseEvent<HTMLDivElement, MouseEvent>)=> {
    e.preventDefault();
    
    const el = e.target as HTMLInputElement
    const value: string | null = el.getAttribute('data-value')      
    this.setState({
      isDragging: true,
      target: (value) ? value : undefined,
      clientpos: {
        x: e.clientX,
        y: e.clientY
      }
    });
  }
  
  handleDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>{
    if (this.state.isDragging) {
      const markers = this.state.markers.slice();
      const clientpos = this.state.clientpos;
      const targetKey = this.state.target;
      const idx = markers.findIndex((item)=>{
        return item.key=== targetKey;
      });
      const coordinate = markers[idx].coordinate.slice();
      coordinate[0] += e.clientY - clientpos.y;
      coordinate[1] += e.clientX - clientpos.x;
      if (coordinate[0] <= this.state.range.maxY && coordinate[0] >= 0
        && coordinate[1] <= this.state.range.maxX && coordinate[1] >= 0) {
        markers[idx].coordinate = coordinate;
        this.setState({
          markers: markers,
          clientpos: {
            y: e.clientY,
            x: e.clientX
          }
        });
      } else {
        this.setState({
          clientpos: {
            y: e.clientY,
            x: e.clientX,
          },
          isDragging: false,
        });
      }
    };
  }
    
  handleDragEnd = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.setState({
      isDragging: false,
    });
  }
  
  handleImgLoad = ({target}: {target: EventTarget}) =>{
    const el = target as HTMLElement;
    this.setState({
      range:{
        maxX: el.offsetWidth - this.props.markerSize.width,
        maxY: el.offsetHeight - this.props.markerSize.height,
        minY: 0,
        minX: 0
      }
    });
  }
  
  render(){
    const markers = this.state.markers;
    const pins =  markers.map((marker, idx)=>{
      return (
        <div key={marker.key} className="map-marker"
          style={{
            top: marker.coordinate[0] ,
            left: marker.coordinate[1] ,
            cursor: (this.state.isDragging)?'move': 'pointer',
          }}
          onMouseDown={(e:React.MouseEvent<HTMLDivElement, MouseEvent>)=>{this.handleDragStart(e);}}
          onMouseUp={(e: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{this.handleDragEnd(e);}}
        >
          <img alt='pin' data-value={marker.key} src={icon}/>
        </div>
      );
    })

    return (
      <>
        <h3 className='title'>React Draggable Component</h3>
        <div className='layout'
          onMouseMove={(e:React.MouseEvent<HTMLDivElement, MouseEvent>)=>{this.handleDrag(e);}} 
        >
          <img src={map} alt='map' 
              onClick={(e: React.MouseEvent<HTMLImageElement, MouseEvent>)=>{this.handleImgClick(e);}} 
              onLoad={(e: React.SyntheticEvent<HTMLImageElement, Event>)=>{this.handleImgLoad(e);}}/>
          <div>
            {pins}
          </div>
        </div>
        <b>Description:</b>
        <div>1. Click add marker</div>
        <div>2. Drag marker</div>
        <a className="home" href='/'>HOME</a>
      </>
    );
  };
}