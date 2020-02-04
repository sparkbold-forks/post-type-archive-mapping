/**
 * External dependencies
 */
import dayjs from 'dayjs';
import classnames from 'classnames';
import axios from 'axios';
var HtmlToReactParser = require('html-to-react').Parser;

const { Component, Fragment } = wp.element;

const { __ } = wp.i18n;

const { decodeEntities } = wp.htmlEntities;

const {
	PanelBody,
	Placeholder,
	QueryControls,
	RangeControl,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl,
	ToggleControl,
	Toolbar,
} = wp.components;

const {
	MediaUpload,
	InspectorControls,
	BlockAlignmentToolbar,
	BlockControls,
	PanelColorSettings,
} = wp.blockEditor;


const MAX_POSTS_COLUMNS = 6;

class PTAM_Custom_Posts_Advanced extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
		};
	}

	render() {

		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Custom Posts Advanced Settings', 'post-type-archive-mapping' ) }>

				</PanelBody>
			</InspectorControls>
		);
		return (
			<Fragment>
				{ inspectorControls }
				<Placeholder>
					<div className="ptam-loading">
						<h1><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/><path d="M0 0h24v24H0z" fill="none"/></svg> {__( 'Custom Posts Advanced', 'post-type-archive-mapping' )}</h1>
						<h2>{__( 'Finding items...', 'post-type-archive-mapping' )} <Spinner /></h2>
					</div>
				</Placeholder>
			</Fragment>
		);
	}
}

export default PTAM_Custom_Posts_Advanced;