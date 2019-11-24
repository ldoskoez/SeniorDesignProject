import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom'
import classNames from 'classnames';

import Box from '../box/box.jsx';
import DOMElementRenderer from '../../containers/dom-element-renderer.jsx';
import Loupe from '../loupe/loupe.jsx';
import MonitorList from '../../containers/monitor-list.jsx';
import TargetHighlight from '../../containers/target-highlight.jsx';
import GreenFlagOverlay from '../../containers/green-flag-overlay.jsx';
import Question from '../../containers/question.jsx';
import MicIndicator from '../mic-indicator/mic-indicator.jsx';
import {STAGE_DISPLAY_SIZES} from '../../lib/layout-constants.js';
import {getStageDimensions} from '../../lib/screen-utils.js';
import styles from './pdollarbox.css';
import * as pdollartools from './pdollar.js';
//import {PointCloud} from './pdollar.js'; 

export class Pdollarbox extends React.Component {
  
  
//
        // Startup

        //// global variables
        touchx;
        touchy;
        _isDown = false;
        _points;
        _strokeID;
        _r;
        _g;
        _rc; 
        _mostRecentGesture;

        onLoadEvent()
        {
            this._mostRecentGesture = 'x';
            

            console.log("beginning");
            this._points = new Array(); // point array for current stroke
            this._strokeID = 0;
            var _r = new pdollartools.PDollarRecognizer();
            this._r = _r;

            //var canvas = document.getElementById('myCanvas');
            var canvas = this.refs.myCanvas1;
            this._g = canvas.getContext('2d');
            this._g.lineWidth = 3;
            this._g.font = "16px Gentilis";
            this._g.fillStyle = "rgb(255,255,136)";
            var _rc = this.getCanvasRect(canvas); // canvas rect on page
            this._g.fillRect(0, 0, _rc.width, 20);
            console.log("here");

            this._rc = _rc;
            this._rc.x = _rc.x;
            this._rc.y = _rc.y;

            this._isDown = false;
        }

        setCanvasEvent()
        {
           
        }
        getCanvasRect(canvas)
        {
            var w = canvas.width;
            var h = canvas.height;

            console.log(w);

            var cx = canvas.offsetLeft;
            var cy = canvas.offsetTop;
            while (canvas.offsetParent != null)
            {
                canvas = canvas.offsetParent;
                cx += canvas.offsetLeft;
                cy += canvas.offsetTop;
            }
            console.log(cx);
            return {x: cx, y: cy, width: w, height: h};
        }
        getScrollX()
        {
            var scrollX = window.scrollLeft;
            return scrollX;
        }
        getScrollY()
        {
            var scrollY = window.scrollTop;
            return scrollY;
        }



        //Touch Events

        touchStart(touch) {
            this._isDown = true;
            var x=touch[0].pageX-touch[0].target.offsetLeft;
            var y=touch[0].pageY-touch[0].target.offsetTop;


                if (this._strokeID == 0) // starting a new gesture
                    {
                        this._points.length = 0;
                        this._g.clearRect(0, 0, this._rc.width, this._rc.height);
                    }

                console.log("points", x, y);
                this._points[this._points.length] = new pdollartools.Point(x, y, ++this._strokeID);
                this.drawText("Recording stroke #" + this._strokeID + "...");
                var clr = "rgb(" + this.rand(0,200) + "," + this.rand(0,200) + "," + this.rand(0,200) + ")";
                this._g.strokeStyle = clr;
                this._g.fillStyle = clr;
                this._g.fillRect(x - 4, y - 3, 9, 9);
            }
        

        touchMove(touch) { 
            if (this._isDown)
            {
                
                var x=touch[0].pageX-touch[0].target.offsetLeft;
                var y=touch[0].pageY -touch[0].target.offsetTop;


                this._points[this._points.length] = new pdollartools.Point(x, y, this._strokeID); // append
                var clr = "rgb(" + this.rand(0,200) + "," + this.rand(0,200) + "," + this.rand(0,200) + ")";
                this._g.strokeStyle = clr;
                this._g.fillStyle = clr;
                this._g.fillRect(x - 4, y - 3, 9, 9);
                // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
                //this.drawConnectedPointTouch(this._points.length - 2, this._points.length - 1);
                this.drawDot(x-781,y-343, 5);
                console.log("draw", x , y);
            }
            // Prevent a scrolling action as a result of this touchmove triggering.

        }

        touchEnd(){
            this._isDown=false;
            this.drawText("Stroke #" + this._strokeID + " recorded.");
        }

        drawDot(x,y,size) {
            // Let's use black by setting RGB values to 0, and 255 alpha (completely opaque)
            var r=0; var g=0; var b=0; var a=255;
    
            // Select a fill style
            this._g.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
    
            // Draw a filled circle
            this._g.beginPath();
            this._g.arc(x, y, size, 0, Math.PI*2, true); 
            this._g.closePath();
            this._g.fill();
        }


        //
        // Mouse Events
        //
        mouseDownEvent(x, y, button)
        {
            document.onselectstart = function() { return false; } // disable drag-select
            document.onmousedown = function() { return false; } // disable drag-select
            if (button <= 1)
            {
                this._isDown = true;
                x -= this._rc.x - this.getScrollX();
                y -= this._rc.y - this.getScrollY();
                
                if (this._strokeID == 0) // starting a new gesture
                {
                    this._points.length = 0;
                    this._g.clearRect(0, 0, this._rc.width, this._rc.height);
                }
                this._points[this._points.length] = new pdollartools.Point(x, y, ++this._strokeID);
                this.drawText("Recording stroke #" + this._strokeID + "...");
                var clr = "rgb(" + this.rand(0,200) + "," + this.rand(0,200) + "," + this.rand(0,200) + ")";
                this._g.strokeStyle = clr;
                this._g.fillStyle = clr;
                this._g.fillRect(x - 4, y - 3, 9, 9);
            }
            else if (button == 2)
            {
                this.drawText("Recognizing gesture...");
            }
        }
        mouseMoveEvent(x, y, button)
        {
            if (this._isDown)
            {
                //x -= this._rc.x - this.getScrollX();
                //y -= this._rc.y - this.getScrollY();
                x -= this._rc.x ;
                y -= this._rc.y ;
                console.log("mouse", x,y);
                this._points[this._points.length] = new pdollartools.Point(x, y, this._strokeID); // append
                this.drawConnectedPoint(this._points.length - 2, this._points.length - 1);
                console.log("mouse draw", this._points.length - 2, this._points.length - 1);
            }
        }
        mouseUpEvent(x, y, button)
        {
            document.onselectstart = function() { return true; } // enable drag-select
            document.onmousedown = function() { return true; } // enable drag-select
            if (button <= 1)
            {
                if (this._isDown)
                {
                    this._isDown = false;
                    this.drawText("Stroke #" + this._strokeID + " recorded.");
                }
            }
            else if (button == 2) // segmentation with right-click
            {
                if (this._points.length >= 10)
                {
                    console.log(this._points); //ADDED BLOCK 
                    for(var k=0;k<this._points.length;k++)
                    {
                        if(isNaN(this._points[k]) && k<this._points.length-1)
                        {
                            this._points[k] = this._points[k+1];
                        }
                        else if (isNaN(this._points[k]) && k == this._points.length-1){
                            this._points[k] = this._points[k-1];
                        }

                    }
                    console.log(this._points);
                    var result = this._r.Recognize(this._points);

                    this._mostRecentGesture = result.Name;
                    localStorage.setItem('mostRecentGesture', this._mostRecentGesture);
                    
                    this.onLoadEvent();


                    this._points = [];
                    this._strokeID = 0;
                    this._g.clearRect(0, 0, this._rc.width, this._rc.height);
                    this.drawText("Result: " + result.Name);
                    
                }
                else
                {
                    this.drawText("Too little input made. Please try again.");
                }
                this._strokeID = 0; // signal to begin new gesture on next mouse-down
            }
        }
        drawConnectedPoint(from, to)
        {
            console.log("hi from draw");
            this._g.beginPath();
            this._g.moveTo(this._points[from].X, this._points[from].Y);
            this._g.lineTo(this._points[to].X, this._points[to].Y);
            this._g.closePath();
            this._g.stroke();
        }

        drawConnectedPointTouch(from, to)
        {
            console.log("hi from draw");
            this._g.beginPath();
            this._g.moveTo(this._points[from].X-814, this._points[from].Y-373);
            this._g.lineTo(this._points[to].X, this._points[to].Y);
            this._g.closePath();
            this._g.stroke();
        }
        drawText(str)
        {
            this._g.fillStyle = "rgb(255,255,136)";
            this._g.fillRect(0, 0, this._rc.width, 20);
            this._g.fillStyle = "rgb(0,0,255)";
            this._g.fillText(str, 1, 14);
        }
        rand(low, high)
        {
            return Math.floor((high - low + 1) * Math.random()) + low;
        }
        round(n, d) // round 'n' to 'd' decimals
        {
            d = Math.pow(10, d);
            return Math.round(n * d) / d;
        }



        
        //
        // Multistroke Adding and Clearing
        //
        onClickAddExisting()
        {
            if (_points.length >= 10)
            {
                var pointclouds = document.getElementById('pointclouds');
                var name = pointclouds[pointclouds.selectedIndex].value;
                var num = _r.AddGesture(name, _points);
                drawText("\"" + name + "\" added. No. of \"" + name + "\" defined: " + num + ".");
                _strokeID = 0; // signal to begin new gesture on next mouse-down
            }
        }
        onClickAddCustom()
        {
            var name = document.getElementById('custom').value;
            if (_points.length >= 10 && name.length > 0)
            {
                var num = _r.AddGesture(name, _points);
                drawText("\"" + name + "\" added. No. of \"" + name + "\" defined: " + num + ".");
                _strokeID = 0; // signal to begin new gesture on next mouse-down
            }
        }
        onClickCustom()
        {
            document.getElementById('custom').select();
        }
        onClickDelete()
        {
            var num = _r.DeleteUserGestures(); // deletes any user-defined templates
            alert("All user-defined gestures have been deleted. Only the 1 predefined gesture remains for each of the " + num + " types.");
            _strokeID = 0; // signal to begin new gesture on next mouse-down
        }
        onClickClearStrokes()
        {
            this.onLoadEvent();


            this._points = [];
            this._strokeID = 0;
            this._g.clearRect(0, 0, this._rc.width, this._rc.height);
            this.drawText("Canvas cleared.");
        }

        onClickRecognizeStrokes(){
         if (this._points.length >= 10)
                {
                    console.log(this._points); //ADDED BLOCK 
                    for(var k=0;k<this._points.length;k++)
                    {
                        if(isNaN(this._points[k]) && k<this._points.length-1)
                        {
                            this._points[k] = this._points[k+1];
                        }
                        else if (isNaN(this._points[k]) && k == this._points.length-1){
                            this._points[k] = this._points[k-1];
                        }

                    }
                    console.log(this._points);
                    var result = this._r.Recognize(this._points);
                    console.log(result.Name);
                    this._mostRecentGesture = result.Name;
                    localStorage.setItem('mostRecentGesture', this._mostRecentGesture);

                    this._points = [];
                    this._strokeID = 0;
                    this._g.clearRect(0, 0, this._rc.width, this._rc.height);
                    this.drawText("Result: " + result.Name);
                }
                else
                {                    
                    this._points = [];
                    this._strokeID = 0;
                    this._g.clearRect(0, 0, this._rc.width, this._rc.height);
                    this.drawText("Too little input made.");
                }
                
                
                this._strokeID = 0; // signal to begin new gesture on next mouse-down

        }

        doNothing(){
            return 0;
        }

        afterRecognizeClearStrokes()
        {
           
            console.log("HI after rec");
            this._points = [];
            this._strokeID = 0;
            this._g.clearRect(0, 0, this._rc.width, this._rc.height);
            //this.drawText("Canvas cleared.");
        }
     

//componentDidMount(){
 //   console.log("compdidmount");
 //   var canvas = ReactDOM.findDOMNode(this.refs.myCanvas);
 //   this.onLoadEvent(canvas);
 // }



   render() {
    return (
         
         <Box
           className={classNames(
                styles.pdollarbox
                       
                   )}   
                   
         >

        
   
      <div style={{ position: 'relative', left: '0', top: '0', width: '10%', height: '10%'}}>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        
        <table border={0} cellSpacing={0}>
          <tbody><tr>
             
              <td valign="top" align="left">
                <table border={0} cellPadding={0} cellSpacing={0}>
                  <tbody><tr>
                      <td valign="bottom">
                       
                      </td>
                      <td valign="middle"><input type="button"  style={{width: '64px', float: 'right'}} defaultValue=" Clear  " onClick={this.onClickClearStrokes.bind(this)} /></td>
                      <td valign="middle"><input type="button"  style={{width: '80px', float: 'right'}} defaultValue=" Recognize  " onClick={this.onClickRecognizeStrokes.bind(this)} /></td>
                    </tr>
                  </tbody></table>
                <canvas id="myCanvas" width = '145px' height = '87px' ref ="myCanvas1" style={{backgroundColor: '#dddddd'}} onMouseDown= {(e) => this.mouseDownEvent( e.clientX, e.clientY, e.button)} onMouseMove = {(e) => this.mouseMoveEvent(e.clientX, e.clientY, e.button)} onMouseUp = {(e) => this.mouseUpEvent(e.clientX, e.clientY, e.button)} onTouchStart = {(e) => this.touchStart(e.changedTouches)} onTouchMove = {(e) => this.touchMove(e.changedTouches)} onTouchEnd = {(e) => this.touchEnd()}>
                  <span style={{backgroundColor: '#ffff88'}}>The &lt;canvas&gt; element is not supported by this browser.</span>
                </canvas>
            {/* canvas.addEventListener('touchstart', this.sketchpad_touchStart, false);
            canvas.addEventListener('touchmove', this.sketchpad_touchMove, false); */}

                {/*<p align="center" style="margin-top:10em;margin-bottom:10em"><i>Canvas coming soon...</i></p>*/}
                {/* Editing area below stroking canvas area */}
                {/* End of editing area below stroking canvas area */}

              </td>
            </tr>
          </tbody></table>
        <p />
        
       </div>

       
     </Box>
    
    );
  }
}




