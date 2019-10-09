import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import Renderer from 'scratch-render';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import {STAGE_DISPLAY_SIZES} from '../lib/layout-constants';
import {getEventXY} from '../lib/touch-utils';
import VideoProvider from '../lib/video/video-provider';
import {SVGRenderer as V2SVGAdapter} from 'scratch-svg-renderer';
import {BitmapAdapter as V2BitmapAdapter} from 'scratch-svg-renderer';

//import PdollarComponent from '../components/pdollarbox/pdollarbox.jsx';

import {
    activateColorPicker,
    deactivateColorPicker
} from '../reducers/color-picker';

export class Pdollarbox extends React.Component {
  
    render () {
       
        return (
            <div>
                <Box
                    className={classNames(
                        styles.pdollarbox
                       
                    )}             
                >
                </Box>
                
              
             </div>
        );
    }
}


