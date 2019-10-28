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
        _isDown = false;
        _points;
        _strokeID;
        _r;
        _g;
        _rc; 
        onLoadEvent()
        {
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
            //this._rc.width = _rc.width;
            //this._rc.height = _rc.height;
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
                x -= this._rc.x - this.getScrollX();
                y -= this._rc.y - this.getScrollY();
                this._points[this._points.length] = new pdollartools.Point(x, y, this._strokeID); // append
                this.drawConnectedPoint(this._points.length - 2, this._points.length - 1);
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
                    console.log(this._r);
                    var result = this._r.Recognize(this._points);
                    this.drawText("Result: " + result.Name + " (" + round(result.Score,2) + ") in " + result.Time + " ms.");
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
            this._g.beginPath();
            this._g.moveTo(this._points[from].X, this._points[from].Y);
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
                    </tr>
                  </tbody></table>
                <canvas id="myCanvas" width = '145px' height = '87px' ref ="myCanvas1" style={{backgroundColor: '#dddddd'}} onMouseDown= {(e) => this.mouseDownEvent( e.clientX, e.clientY, e.button)} onMouseMove = {(e) => this.mouseMoveEvent(e.clientX, e.clientY, e.button)} onMouseUp = {(e) => this.mouseUpEvent(e.clientX, e.clientY, e.button)} >
                  <span style={{backgroundColor: '#ffff88'}}>The &lt;canvas&gt; element is not supported by this browser.</span>
                </canvas>


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




