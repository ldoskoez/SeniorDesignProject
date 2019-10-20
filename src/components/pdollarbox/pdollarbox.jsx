import PropTypes from 'prop-types';
import React from 'react';
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
import * as pdollar from './pdollar.js'; 

export class Pdollarbox extends React.Component {
  
  //render(){
    //return(
     
    //            <Box
    //                className={classNames(
    //                    styles.pdollarbox
                       
    //                )}
                    
   //             >
                
  //              </Box>
                
  //
  //  );
 // }
  
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
            this._points = new Array(); // point array for current stroke
            this._strokeID = 0;
            this._r = new pdollar.PDollarRecognizer();

            var canvas = document.getElementById('myCanvas');
            _g = canvas.getContext('2d');
            console.log("here");
            _g.lineWidth = 3;
            _g.font = "16px Gentilis";
            _rc = getCanvasRect(canvas); // canvas rect on page
            _g.fillStyle = "rgb(255,255,136)";
            _g.fillRect(0, 0, _rc.width, 20);

            _isDown = false;
        }
        getCanvasRect(canvas)
        {
            var w = canvas.width;
            var h = canvas.height;

            var cx = canvas.offsetLeft;
            var cy = canvas.offsetTop;
            while (canvas.offsetParent != null)
            {
                canvas = canvas.offsetParent;
                cx += canvas.offsetLeft;
                cy += canvas.offsetTop;
            }
            return {x: cx, y: cy, width: w, height: h};
        }
        getScrollX()
        {
            var scrollX = $(window).scrollLeft();
            return scrollX;
        }
        getScrollY()
        {
            var scrollY = $(window).scrollTop();
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
                _isDown = true;
                x -= _rc.x - getScrollX();
                y -= _rc.y - getScrollY();
                if (_strokeID == 0) // starting a new gesture
                {
                    _points.length = 0;
                    _g.clearRect(0, 0, _rc.width, _rc.height);
                }
                _points[_points.length] = new Point(x, y, ++_strokeID);
                drawText("Recording stroke #" + _strokeID + "...");
                var clr = "rgb(" + rand(0,200) + "," + rand(0,200) + "," + rand(0,200) + ")";
                _g.strokeStyle = clr;
                _g.fillStyle = clr;
                _g.fillRect(x - 4, y - 3, 9, 9);
            }
            else if (button == 2)
            {
                drawText("Recognizing gesture...");
            }
        }
        mouseMoveEvent(x, y, button)
        {
            if (this._isDown)
            {
                x -= _rc.x - getScrollX();
                y -= _rc.y - getScrollY();
                _points[_points.length] = new Point(x, y, _strokeID); // append
                drawConnectedPoint(_points.length - 2, _points.length - 1);
            }
        }
        mouseUpEvent(x, y, button)
        {
            document.onselectstart = function() { return true; } // enable drag-select
            document.onmousedown = function() { return true; } // enable drag-select
            if (button <= 1)
            {
                if (_isDown)
                {
                    _isDown = false;
                    drawText("Stroke #" + _strokeID + " recorded.");
                }
            }
            else if (button == 2) // segmentation with right-click
            {
                if (_points.length >= 10)
                {
                    var result = _r.Recognize(_points);
                    drawText("Result: " + result.Name + " (" + round(result.Score,2) + ") in " + result.Time + " ms.");
                }
                else
                {
                    drawText("Too little input made. Please try again.");
                }
                _strokeID = 0; // signal to begin new gesture on next mouse-down
            }
        }
        drawConnectedPoint(from, to)
        {
            _g.beginPath();
            _g.moveTo(_points[from].X, _points[from].Y);
            _g.lineTo(_points[to].X, _points[to].Y);
            _g.closePath();
            _g.stroke();
        }
        drawText(str)
        {
            _g.fillStyle = "rgb(255,255,136)";
            _g.fillRect(0, 0, _rc.width, 20);
            _g.fillStyle = "rgb(0,0,255)";
            _g.fillText(str, 1, 14);
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
            
            this._points = [];
            this._strokeID = 0;
            this._g.clearRect(0, 0, _rc.width, _rc.height);
            drawText("Canvas cleared.");
        }
     


   render() {
    return (
        <Box
           className={classNames(
                styles.pdollarbox
                       
                   )}             
         >


    <body onload={this.onLoadEvent()}>
      <div style={{ position: 'relative', left: '0', top: '0', width: '10%', height: '10%'}}>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <title>$P Recognizer</title>
      

        {/*[if IE]><![endif]*/}

        
        <p className="subhead" data-component="subhead">Demo</p>
        <p>
        </p><table border={0} cellSpacing={10}>
          <tbody><tr>
              <td valign="top">
                <img src="multistrokes.gif" /><br />
              </td>
              <td valign="top" align="left">
                <table border={0} cellPadding={0} cellSpacing={0}>
                  <tbody><tr>
                      <td valign="bottom">
                        <p style={{fontSize: '10pt'}}><i>Make strokes on this canvas.
                            <b><u>Right-click</u> the canvas to recognize.</b>
                          </i>
                        </p>
                      </td>
                      <td valign="middle"><input type="button" style={{width: '64px', float: 'right'}} defaultValue=" Clear  " onClick={this.onClickClearStrokes()} /></td>
                    </tr>
                  </tbody></table>
                <canvas id="myCanvas"  style={{backgroundColor: '#dddddd'}} onMouseDown={ this.mouseDownEvent(event.clientX, event.clientY, event.button)} onMouseMove={this.mouseMoveEvent(event.clientX, event.clientY, event.button)} onMouseUp={this.mouseUpEvent(event.clientX, event.clientY, event.button)} >
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
       </body>
      </Box>
    );
  }
}


