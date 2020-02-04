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

class PTAM_Custom_Posts extends Component {
	constructor() {
		super( ...arguments );

		this.toggleDisplayPostDate = this.toggleDisplayPostDate.bind( this );
		this.toggleDisplayPostExcerpt = this.toggleDisplayPostExcerpt.bind( this );
		this.toggleDisplayPostAuthor = this.toggleDisplayPostAuthor.bind( this );
		this.toggleDisplayPostImage = this.toggleDisplayPostImage.bind( this );
		this.toggleDisplayPostLink = this.toggleDisplayPostLink.bind( this );
		this.toggleDisplayPagination = this.toggleDisplayPagination.bind(this);
		this.toggleDisplayCustomFields = this.toggleDisplayCustomFields.bind(this);
		this.toggleDisplayTitle = this.toggleDisplayTitle.bind(this);
		this.toggleRemoveStyles = this.toggleRemoveStyles.bind(this);
		this.get_latest_data = this.get_latest_data.bind(this);
		this.get_latest_posts = this.get_latest_posts.bind(this);
		this.get_term_list = this.get_term_list.bind(this);

		this.state = {
			loading: true,
			postType: 'post',
			taxonomy: 'category',
			term: 0,
			latestPosts: [],
			postTypeList: [],
			taxonomyList: [],
			termsList: [],
			imageSizes: [],
			fonts: [],
			userTaxonomies: [],
			userTerms: [],
			imageLocation: this.props.attributes.imageLocation,
			taxonomyLocation: this.props.attributes.taxonomyLocation,
			avatarSize: this.props.attributes.avatarSize,
			imageType: this.props.attributes.imageType,
		};

		this.get_latest_data();
	}

	get_latest_posts ( object = {} ) {
		this.setState( { 'loading': true } );
		const props = jQuery.extend({}, this.props.attributes, object);
		let { postType, order, orderBy, taxonomy, avatarSize, imageType, imageTypeSize,term, postsToShow, imageCrop, linkColor, fallbackImg } = props;
		linkColor = linkColor.replace( '#', '' );
		axios.post(ptam_globals.rest_url + `ptam/v2/get_posts`, { post_type: postType, order: order, orderby: orderBy, taxonomy: taxonomy, term: term, posts_per_page: postsToShow, image_size: imageCrop, avatar_size: avatarSize, image_type: imageType, image_size: imageTypeSize, link_color: linkColor, default_image: fallbackImg } ).then( ( response ) => {
			// Now Set State
			this.setState( {
				loading: false,
				latestPosts: response.data.posts,
				imageSizes: response.data.image_sizes,
				fonts: response.data.fonts,
				userTaxonomies: response.data.taxonomies,
				userTerms: response.data.terms
			} );
		} );
	}

	get_term_list( object = {} ) {
		let termsList = [];
		const props = jQuery.extend({}, this.props.attributes, object);
		const { postType, taxonomy } = props;
		axios.post( ptam_globals.rest_url + `ptam/v2/get_terms`, { taxonomy: taxonomy, post_type: postType } ).then( ( response ) => {
			if( Object.keys(response.data).length > 0 ) {
				termsList.push( { 'value': 0, 'label': __('All',  'post-type-archive-mapping') } );
				jQuery.each( response.data, function( key, value ) {
					termsList.push( { 'value': value.term_id, 'label': value.name } );
				} );
			}
			this.setState( {
				'loading': false,
				'termsList': termsList,
			} );
		} );
	}

	get_latest_data( object = {} ) {
		this.setState( { 'loading': true } );
		let latestPosts = [];
		let imageSizes = [];
		let postTypeList = [];
		let taxonomyList = [];
		let termsList = [];
		let userTaxonomies = [];
		let userTerms = [];
		let fonts = [];
		const props = jQuery.extend({}, this.props.attributes, object);
		let { postType, order, orderBy, avatarSize,imageType,imageTypeSize,taxonomy, term, postsToShow, imageCrop, linkColor, fallbackImg } = props;

		linkColor = linkColor.replace( '#', '' );

		// Get Latest Posts and Chain Promises
		axios.post(ptam_globals.rest_url + `ptam/v2/get_posts`, { post_type: postType, order: order, orderby: orderBy, taxonomy: taxonomy, term: term, posts_per_page: postsToShow, image_size: imageCrop, avatar_size: avatarSize, image_type: imageType, image_size: imageTypeSize, link_color: linkColor, default_image: fallbackImg } ).then( ( response ) => {
				latestPosts = response.data.posts;
				imageSizes = response.data.image_sizes;
				userTaxonomies = response.data.taxonomies;
				fonts = response.data.fonts;

				// Get Post Types
				axios.get(ptam_globals.rest_url + 'wp/v2/types').then( ( response ) => {
					jQuery.each( response.data, function( key, value ) {
						if( 'attachment' != key && 'wp_block' != key ) {
							postTypeList.push( { 'value': key, 'label': value.name } );
						}
					} );

					// Get Terms
					axios.post(ptam_globals.rest_url + `ptam/v2/get_terms`, { taxonomy: taxonomy, post_type: postType } ).then( ( response ) => {
						if( Object.keys(response.data).length > 0 ) {
							termsList.push( { 'value': 0, 'label': __('All',  'post-type-archive-mapping') } );
							jQuery.each( response.data, function( key, value ) {
								termsList.push( { 'value': value.term_id, 'label': value.name } );
							} );
						}

						// Get Taxonomies
						axios.post(ptam_globals.rest_url + `ptam/v2/get_taxonomies`, { post_type: postType } ).then( ( response ) => {
							if( Object.keys(response.data).length > 0 ) {
								taxonomyList.push( { 'value': 'none', 'label': __('Select a Taxonomy',  'post-type-archive-mapping') } );
								jQuery.each( response.data, function( key, value ) {
									taxonomyList.push( { 'value': key, 'label': value.label } );
								} );
							}

							// Now Set State
							this.setState( {
								loading: false,
								imageSizes: imageSizes,
								fonts: fonts,
								latestPosts: latestPosts,
								postTypeList: postTypeList,
								taxonomyList: taxonomyList,
								termsList: termsList,
								userTaxonomies: userTaxonomies,
								userTerms: userTerms,
							} );
						});

					});
				} );
			});
	}

	toggleDisplayTitle() {
		const { displayTitle } = this.props.attributes;
		const { setAttributes } = this.props;
		setAttributes( { displayTitle: ! displayTitle } );
	}
	toggleDisplayCustomFields() {
		const { displayCustomFields } = this.props.attributes;
		const { setAttributes } = this.props;
		setAttributes( { displayCustomFields: ! displayCustomFields } );
	}
	toggleDisplayPostDate() {
		const { displayPostDate } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostDate: ! displayPostDate } );
	}

	toggleDisplayPostExcerpt() {
		const { displayPostExcerpt } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostExcerpt: ! displayPostExcerpt } );
	}

	toggleDisplayPostAuthor() {
		const { displayPostAuthor } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostAuthor: ! displayPostAuthor } );
	}

	toggleDisplayPostImage() {
		const { displayPostImage } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostImage: ! displayPostImage } );
	}

	toggleDisplayPostLink() {
		const { displayPostLink } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { displayPostLink: ! displayPostLink } );
	}

	toggleDisplayPagination() {
		const { pagination } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { pagination: ! pagination } );
	}

	toggleCapitilization = () => {
		const { changeCapitilization } = this.props.attributes;
		const { setAttributes } = this.props;
		setAttributes( { changeCapitilization: ! changeCapitilization } );
	}

	toggleTaxonomyDisplay = () => {
		const { displayTaxonomies } = this.props.attributes;
		const { setAttributes } = this.props;
		setAttributes( { displayTaxonomies: ! displayTaxonomies } );
	}

	toggleRemoveStyles = () => {
		const { removeStyles } = this.props.attributes;
		const { setAttributes } = this.props;
		setAttributes( { removeStyles: ! removeStyles } );
	}

	trimWords = ( value ) => {
		const { setAttributes } = this.props;
		setAttributes( { trimWords: value } );
	}

	customizeReadMoreText() {
		const { readMoreText } = this.props.attributes;
		const { setAttributes } = this.props;

		setAttributes( { readMoreText: ! readMoreText } );
	}

	onChangeLocation = (value) => {
		this.setState( {
			imageLocation: value
		});
	}

	onChangeTaxonomyLocation = (value) => {
		this.setState( {
			taxonomyLocation: value
		});
	}

	onImageTypeChange = ( imageType ) => {
		this.setState( {
			loading: true
		} );

		let latestPosts = [];
		let imageSizes = [];

		let { postType, order, orderBy, taxonomy, term, terms, imageTypeSize, avatarSize,postsToShow, imageCrop, linkColor, fallbackImg } = this.props.attributes;

		linkColor = linkColor.replace( '#', '' );

		// Get Latest Posts and Chain Promises
		axios.post(ptam_globals.rest_url + `ptam/v2/get_images`, { post_type: postType, order: order, orderby: orderBy, taxonomy: taxonomy, term: term, posts_per_page: postsToShow, image_type: imageCrop, avatar_size: avatarSize, image_type: imageType, image_size: imageTypeSize, link_color: linkColor, default_image: fallbackImg } ).then( ( response ) => {
				latestPosts = response.data.posts;
				imageSizes = response.data.image_sizes;
				this.setState( {
					loading: false,
					latestPosts: latestPosts,
					imageSizes: imageSizes,
				} );

		} );

	}

	onImageSizeChange = ( value ) => {
		this.setState( {
			loading: true
		} );

		let latestPosts = [];
		let imageSizes = [];

		let { postType, order, orderBy, taxonomy, term, avatarSize,postsToShow, imageCrop, linkColor, fallbackImg } = this.props.attributes;

		linkColor = linkColor.replace( '#', '' );

		// Get Latest Posts and Chain Promises
		axios.post(ptam_globals.rest_url + `ptam/v2/get_images`, { post_type: postType, order: order, orderby: orderBy, taxonomy: taxonomy, term: term, posts_per_page: postsToShow, image_crop: imageCrop, avatar_size: avatarSize, image_type: 'regular', image_size: value, link_color: linkColor, default_image: fallbackImg } ).then( ( response ) => {
			latestPosts = response.data.posts;
			imageSizes = response.data.image_sizes;
			this.setState( {
				loading: false,
				latestPosts: latestPosts,
				imageSizes: imageSizes,
			} );

		} );

	}

	excerptParse = ( excerpt ) => {
		let htmlToReactParser = new HtmlToReactParser();
		const { trimWords } = this.props.attributes;

		excerpt = excerpt.split(' ').slice(0, trimWords);
		excerpt = excerpt.join(' ');

		return htmlToReactParser.parse(excerpt);
	}

	onAvatarSizeChange = ( value ) => {
		let classRef = this;
		this.setState( {
			loading: true
		} );
		this.props.setAttributes( { avatarSize: value } );
		setTimeout(function(){
			let latestPosts = [];
			let imageSizes = [];

			let { postType, order, orderBy, taxonomy, term, postsToShow, imageCrop, imageTypeSize, imageType, linkColor, fallbackImg } = classRef.props.attributes;

			linkColor = linkColor.replace( '#', '' );

			// Get Latest Posts and Chain Promises
			axios.post(ptam_globals.rest_url + `ptam/v2/get_images`, { post_type: postType, order: order, orderBy: orderBy, taxonomy: taxonomy, term: term, posts_per_page: postsToShow, image_type: imageCrop, avatar_size: value, image_type: imageType, image_size: imageTypeSize, link_color: linkColor, default_image: fallbackImg } ).then( ( response ) => {
				latestPosts = response.data.posts;
				imageSizes = response.data.image_sizes;
				classRef.setState( {
					loading: false,
					latestPosts: latestPosts,
					imageSizes: imageSizes,
				} );

			} );
		}, 3000);
	}

	onFallbackImgChange = ( imgObject ) => {
		let classRef = this;
		this.setState( {
			loading: true,
		} );

		this.props.setAttributes( { fallbackImg: imgObject } );
		setTimeout(function(){
			let latestPosts = [];
			let imageSizes = [];

			let { postType, avatarSize, order, orderBy, taxonomy, term, postsToShow, imageCrop, imageTypeSize, imageType, linkColor, fallbackImg } = classRef.props.attributes;

			linkColor = linkColor.replace( '#', '' );

			// Get Latest Posts and Chain Promises
			axios.post(ptam_globals.rest_url + `ptam/v2/get_images`, { post_type: postType, order: order, orderBy: orderBy, taxonomy: taxonomy, term: term, posts_per_page: postsToShow, image_type: imageCrop, avatar_size: avatarSize, image_type: imageType, image_size: imageTypeSize, link_color: linkColor, default_image: fallbackImg } ).then( ( response ) => {
				latestPosts = response.data.posts;
				imageSizes = response.data.image_sizes;
				classRef.setState( {
					loading: false,
					latestPosts: latestPosts,
					imageSizes: imageSizes,
				} );

			} );
		}, 3000);
	}

	// Colors
	onChangeBorderColor = ( value ) => {
		this.props.setAttributes( { borderColor: value } );
	}
	onChangeBackgroundColor = ( value ) => {
		this.props.setAttributes( { backgroundColor: value } );
	}
	onChangeTitleColor = ( value ) => {
		this.props.setAttributes( { titleColor: value } );
	}
	onChangeCustomFieldsColor = ( value ) => {
		this.props.setAttributes( { customFieldsColor: value } );
	}
	onChangeContentColor = ( value ) => {
		this.props.setAttributes( { contentColor: value } );
	}
	onChangeLinkColor = ( value ) => {
		this.props.setAttributes( { linkColor: value } );
		this.props.attributes.linkColor = value;
		this.get_latest_posts( {} );
	}
	onChangeContinueReadingColor = ( value ) => {
		this.props.setAttributes( { continueReadingColor: value } );
	}

	render() {
		let htmlToReactParser = new HtmlToReactParser();
		const { attributes, setAttributes } = this.props;
		const { postType, term, taxonomy, displayPostDate, displayPostExcerpt, displayPostAuthor, displayPostImage,displayPostLink, align, postLayout, columns, order, pagination, orderBy, postsToShow, readMoreText, imageLocation, taxonomyLocation, imageType, imageTypeSize, avatarSize, changeCapitilization, displayTaxonomies, trimWords, titleAlignment, customFieldAlignment, imageAlignment, metaAlignment, contentAlignment, padding, border, borderRounded, borderColor, backgroundColor, titleColor, customFieldsColor, linkColor, contentColor, continueReadingColor, titleFont, customFieldsFont, metaFont, contentFont, continueReadingFont, displayTitle, displayCustomFields, customFields, removeStyles, titleHeadingTag, fallbackImg } = attributes;

		let userTaxonomies = this.state.userTaxonomies;
		let userTaxonomiesArray = [];
		for (var key in userTaxonomies) {
			userTaxonomiesArray.push({value: key, label: userTaxonomies[key].label});
		};
		let latestPosts = this.state.latestPosts;

		// Thumbnail options
		const imageLocationOptions = [
			{ value: 'regular', label: __('Regular placement', 'post-type-archive-mapping' ) },
			{ value: 'below_title', label: __('Image Below Title', 'post-type-archive-mapping' ) },
			{ value: 'below_title_and_meta', label: __('Below title and post meta', 'post-type-archive-mapping' ) },
			{ value: 'bottom', label: __('Image on bottom', 'post-type-archive-mapping' ) }
		];
		let imageSizeOptions = [];
		let imageSizes = this.state.imageSizes;
		for ( var key in imageSizes ) {
			imageSizeOptions.push( { value: key, label: key })
		}

		// Title Heading Options
		const titleHeadingOptions = [
			{ value: 'h1', label: __('H1', 'post-type-archive-mapping' ) },
			{ value: 'h2', label: __('H2', 'post-type-archive-mapping' ) },
			{ value: 'h3', label: __('H3', 'post-type-archive-mapping' ) },
			{ value: 'h4', label: __('H4', 'post-type-archive-mapping' ) },
			{ value: 'h5', label: __('H5', 'post-type-archive-mapping' ) },
			{ value: 'H6', label: __('H6', 'post-type-archive-mapping' ) },
		];

		// Fonts
		let fontOptions = [];
		let fonts = this.state.fonts;
		for ( var key in fonts ) {
			fontOptions.push( { value: key, label: fonts[key] })
		}

		let imageDisplayOptionsTypes = [];
		imageDisplayOptionsTypes.push( { label: __('Gravatar', 'post-type-archive-mapping' ), value: 'gravatar' } );
		imageDisplayOptionsTypes.push( { label: __('Featured Image', 'post-type-archive-mapping' ), value: 'regular' } );

		const capitilization = changeCapitilization ? "ptam-text-lower-case" : '';

		const taxonomyLocationOptions = [
			{ value: 'regular', label: __('Regular placement', 'post-type-archive-mapping' ) },
			{ value: 'below_content', label: __('Below Content', 'post-type-archive-mapping' ) },
		];

		const alignmentOptions = [
			{ value: 'left', label: __('Left', 'post-type-archive-mapping' ) },
			{ value: 'center', label: __('Center', 'post-type-archive-mapping' ) },
			{ value: 'right', label: __('Right', 'post-type-archive-mapping' ) },
		];

		const orderOptions = [
			{ value: 'ASC', label: __('ASC', 'post-type-archive-mapping' ) },
			{ value: 'DESC', label: __('DESC', 'post-type-archive-mapping' ) },
		];

		const orderByOptions = [
			{ value: 'ID', label: __('ID', 'post-type-archive-mapping' ) },
			{ value: 'menu_order', label: __('Menu Order', 'post-type-archive-mapping' ) },
			{ value: 'author', label: __('Post Author', 'post-type-archive-mapping' ) },
			{ value: 'date', label: __('Date', 'post-type-archive-mapping' ) },
			{ value: 'modified', label: __('Date Modified', 'post-type-archive-mapping' ) },
			{ value: 'name', label: __('Post Slug', 'post-type-archive-mapping' ) },
			{ value: 'title', label: __('Title', 'post-type-archive-mapping' ) },
			{ value: 'rand', label: __('Random', 'post-type-archive-mapping' ) },
		];

		const borderPaddingStyles = {
			padding: padding + 'px',
			border: border + 'px solid ' + borderColor,
			borderRadius: borderRounded + 'px',
			backgroundColor: backgroundColor,
		};


		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Custom Posts Settings', 'post-type-archive-mapping' ) }>

					<SelectControl
							label={ __( 'Post Type', 'post-type-archive-mapping' ) }
							options={ this.state.postTypeList }
							value={ postType }
							onChange={ ( value ) => { this.props.setAttributes( { postType: value, taxonomy: 'none', term: 0 } ); this.get_latest_data({ postType: value, taxonomy: 'none', term: 0 }); } }
					/>
					<SelectControl
							label={ __( 'Taxonomy',  'post-type-archive-mapping' ) }
							options={ this.state.taxonomyList }
							value={ taxonomy }
							onChange={ ( value ) => { this.props.setAttributes( { taxonomy: value } ); this.get_term_list( { taxonomy: value } ); this.get_latest_posts({ taxonomy: value }); } }
					/>
					<SelectControl
							mutltiple
							label={ __( 'Terms',  'post-type-archive-mapping' ) }
							options={ this.state.termsList }
							value={ term }
							onChange={ ( value ) => { this.props.setAttributes( { term: value } ); this.get_latest_posts({ term: value }); } }
					/>
					<SelectControl
						label={ __( 'Order', 'post-type-archive-mapping' ) }
						options={ orderOptions }
						value={ order }
						onChange={ ( value ) => { this.props.setAttributes( { order: value } ); this.get_latest_posts({order: value }); } }
					/>
					<SelectControl
						label={ __( 'Order By', 'post-type-archive-mapping' ) }
						options={ orderByOptions }
						value={ orderBy }
						onChange={ ( value ) => { this.props.setAttributes( { orderBy: value } ); this.get_latest_posts({orderBy: value }); } }
					/>
					<RangeControl
						label={ __( 'Number of Items',  'post-type-archive-mapping' ) }
						value={ postsToShow }
						onChange={ ( value ) => { this.props.setAttributes( { postsToShow: value } ); this.get_latest_posts({ postsToShow: value } ); } }
						min={ 1 }
						max={ 100 }
					/>
					{ postLayout === 'grid' &&
						<RangeControl
							label={ __( 'Columns',  'post-type-archive-mapping' ) }
							value={ columns }
							onChange={ ( value ) => this.props.setAttributes( { columns: value } ) }
							min={ 1 }
							max={ ! hasPosts ? MAX_POSTS_COLUMNS : Math.min( MAX_POSTS_COLUMNS, latestPosts.length ) }
						/>
					}
				</PanelBody>
				<PanelBody title={ __( 'Title', 'post-type-archive-mapping' ) } initialOpen={false}>
					<ToggleControl
						label={ __( 'Display Title',  'post-type-archive-mapping' ) }
						checked={ displayTitle }
						onChange={ this.toggleDisplayTitle }
					/>
					<SelectControl
						label={ __( 'Title Heading Tag',  'post-type-archive-mapping' ) }
						options={ titleHeadingOptions }
						value={ titleHeadingTag }
						onChange={ ( value ) => { this.props.setAttributes( { titleHeadingTag: value } ); }}
					/>
				</PanelBody>
				<PanelBody title={ __( 'Custom Fields', 'post-type-archive-mapping' ) } initialOpen={false}>
					<ToggleControl
						label={ __( 'Display Custom Fields',  'post-type-archive-mapping' ) }
						checked={ displayCustomFields }
						onChange={ this.toggleDisplayCustomFields }
					/>
					{ displayCustomFields &&
						<TextareaControl
							label={ __( 'Enter Custom Field Markup', 'post-type-archive-mapping' ) }
							help={ __( 'HTML allowed. Place custom fields inbetween {}: {custom_field_1}', 'post-type-archive-mapping' ) }
							value={customFields}
							onChange={ ( value ) => { 
								this.props.setAttributes( { customFields: value } );
							} }
						/>
					}
				</PanelBody>
				<PanelBody title={ __( 'Featured Image', 'post-type-archive-mapping' ) }>
					<ToggleControl
						label={ __( 'Display Featured Image',  'post-type-archive-mapping' ) }
						checked={ displayPostImage }
						onChange={ this.toggleDisplayPostImage }
					/>
					{ displayPostImage &&
						<Fragment>
							<SelectControl
								label={ __( 'Image Type',  'post-type-archive-mapping' ) }
								options={ imageDisplayOptionsTypes}
								value={ imageType }
								onChange={ ( value ) => { this.props.setAttributes( { imageType: value } ); this.onImageTypeChange( value ); } }
							/>
							{ 'gravatar' === imageType ?
								<div>
									<RangeControl
										label={ __( 'Avatar Size',  'post-type-archive-mapping' ) }
										value={ avatarSize }
										onChange={ ( value ) => { this.props.setAttributes( { avatarSize: value } ); this.onAvatarSizeChange( value ); } }
										min={ 16 }
										max={ 512 }
									/>
								</div>
								: ''
							}
							{ 'gravatar' !== imageType &&
								<Fragment>
									<MediaUpload
										onSelect={ ( imageObject ) => {
											this.props.setAttributes( { fallbackImg: imageObject } ); this.props.attributes.fallbackImg = imageObject;
											this.onFallbackImgChange( imageObject );
										} }
										type="image"
										value={ fallbackImg.url }
										render={ ( { open } ) => (
											<Fragment>
												<button className="ptam-media-alt-upload components-button is-button secondary" onClick={ open }>
													{ __( 'Fallback Featured Image', 'post-type-archive-mapping' ) }
												</button>
												{ fallbackImg &&

													<Fragment>
														<div>
															<img src={ fallbackImg.url } alt={ __( 'Featured Image', 'post-type-archive-mapping' ) } width="250" height="250" />
														</div>
														<div>
															<button className="ptam-media-alt-reset components-button is-button secondary" onClick={ ( event ) => {
																this.props.setAttributes( { fallbackImg: '' } ); this.props.attributes.fallbackImg = ''; 
																this.onFallbackImgChange( 0 );
															} }>
																{ __( 'Reset Image', 'post-type-archive-mapping' ) }
															</button>
														</div>
													</Fragment>
												}
											</Fragment>
										) }
									/>
									<SelectControl
										label={ __( 'Featured Image Size',  'post-type-archive-mapping' ) }
										options={ imageSizeOptions }
										value={ imageTypeSize }
										onChange={ ( value ) => { this.props.setAttributes( { imageTypeSize: value } ); this.onImageSizeChange( value ); }}
									/>
								</Fragment>
							}
							<SelectControl
								label={ __( 'Image Location',  'post-type-archive-mapping' ) }
								options={ imageLocationOptions }
								value={ this.state.imageLocation }
								onChange={ ( value ) => { this.props.setAttributes( { imageLocation: value } ); this.onChangeLocation(value);  } }
							/>
						</Fragment>
					}
				</PanelBody>
				<PanelBody title={ __( 'Options', 'post-type-archive-mapping' ) }>
					<ToggleControl
						label={ __( 'Display Taxonomies',  'post-type-archive-mapping' ) }
						checked={ displayTaxonomies }
						onChange={ this.toggleTaxonomyDisplay }
					/>
					{ displayTaxonomies &&
						<SelectControl
							label={ __( 'Taxonomy Location',  'post-type-archive-mapping' ) }
							options={ taxonomyLocationOptions }
							value={ this.state.taxonomyLocation }
							onChange={ ( value ) => {this.onChangeTaxonomyLocation(value); this.props.setAttributes( { taxonomyLocation: value } ) } }
						/>
					}
					<ToggleControl
						label={ __( 'Display Post Author',  'post-type-archive-mapping' ) }
						checked={ displayPostAuthor }
						onChange={ this.toggleDisplayPostAuthor }
					/>
					<ToggleControl
						label={ __( 'Display Post Date',  'post-type-archive-mapping' ) }
						checked={ displayPostDate }
						onChange={ this.toggleDisplayPostDate }
					/>
					<ToggleControl
						label={ __( 'Display Post Excerpt',  'post-type-archive-mapping' ) }
						checked={ displayPostExcerpt }
						onChange={ this.toggleDisplayPostExcerpt }
					/>
					{ displayPostExcerpt &&
						<TextControl
							label={ __( 'Maximum Word Length of Excerpt',  'post-type-archive-mapping' ) }
							type="number"
							value={ trimWords }
							onChange={ ( value ) => this.trimWords( value ) }
						/>
					}
					<ToggleControl
						label={ __( 'Display Pagination',  'post-type-archive-mapping' ) }
						checked={ pagination }
						onChange={ this.toggleDisplayPagination }
					/>
					<ToggleControl
						label={ __( 'Change Capitilization',  'post-type-archive-mapping' ) }
						checked={ changeCapitilization }
						onChange={ this.toggleCapitilization }
					/>
					<ToggleControl
						label={ __( 'Display Continue Reading Link',  'post-type-archive-mapping' ) }
						checked={ displayPostLink }
						onChange={ this.toggleDisplayPostLink }
					/>
					{ displayPostLink &&
					<TextControl
						label={ __( 'Customize Read More Link',  'post-type-archive-mapping' ) }
						type="text"
						value={ readMoreText }
						onChange={ ( value ) => this.props.setAttributes( { readMoreText: value } ) }
					/>
					}
					<ToggleControl
						label={ __( 'Overwrite styles',  'post-type-archive-mapping' ) }
						checked={ removeStyles }
						onChange={ this.toggleRemoveStyles }
					/>
				</PanelBody>
				{ postLayout === 'grid' && ! removeStyles &&
					<PanelBody title={ __( 'Alignment', 'post-type-archive-mapping' ) } initialOpen={false}>
						<SelectControl
							label={ __( 'Title Alignment', 'post-type-archive-mapping' ) }
							options={ alignmentOptions }
							value={ titleAlignment }
							onChange={ ( value ) => { this.props.setAttributes( { titleAlignment: value } ); } }
						/>
						<SelectControl
							label={ __( 'Custom Fields Alignment', 'post-type-archive-mapping' ) }
							options={ alignmentOptions }
							value={ customFieldAlignment }
							onChange={ ( value ) => { this.props.setAttributes( { customFieldAlignment: value } ); } }
						/>
						<SelectControl
							label={ __( 'Image Alignment', 'post-type-archive-mapping' ) }
							options={ alignmentOptions }
							value={ imageAlignment }
							onChange={ ( value ) => { this.props.setAttributes( { imageAlignment: value } ); } }
						/>
						<SelectControl
							label={ __( 'Meta Alignment', 'post-type-archive-mapping' ) }
							options={ alignmentOptions }
							value={ metaAlignment }
							onChange={ ( value ) => { this.props.setAttributes( { metaAlignment: value } ); } }
						/>
						<SelectControl
							label={ __( 'Content Alignment', 'post-type-archive-mapping' ) }
							options={ alignmentOptions }
							value={ contentAlignment }
							onChange={ ( value ) => { this.props.setAttributes( { contentAlignment: value } ); } }
						/>
					</PanelBody>
				}
				{ ! removeStyles &&
					<Fragment>
						<PanelBody title={ __( 'Borders and Padding', 'post-type-archive-mapping' ) } initialOpen={false}>
							<RangeControl
								label={ __( 'Padding', 'post-type-archive-mapping' ) }
								value={ padding }
								onChange={ ( value ) => this.props.setAttributes( { padding: value } ) }
								min={ 0 }
								max={ 60 }
								step={ 1 }
							/>
							<RangeControl
								label={ __( 'Border', 'post-type-archive-mapping' ) }
								value={ border }
								onChange={ ( value ) => this.props.setAttributes( { border: value } ) }
								min={ 0 }
								max={ 10 }
								step={ 1 }
							/>
							<PanelColorSettings
								title={ __( 'Border Color', 'post-type-archive-mapping' ) }
								initialOpen={ true }
								colorSettings={ [ {
									value: borderColor,
									onChange: this.onChangeBorderColor,
									label: __( 'Border Color', 'post-type-archive-mapping' ),
								} ] }
								>
							</PanelColorSettings>
							<RangeControl
								label={ __( 'Border Rounded', 'post-type-archive-mapping' ) }
								value={ borderRounded }
								onChange={ ( value ) => this.props.setAttributes( { borderRounded: value } ) }
								min={ 0 }
								max={ 10 }
								step={ 1 }
							/>
						</PanelBody>
						<PanelBody title={ __( 'Background and Colors', 'post-type-archive-mapping' ) } initialOpen={false}>
							<PanelColorSettings
								title={ __( 'Background Color', 'post-type-archive-mapping' ) }
								initialOpen={ true }
								colorSettings={ [ {
									value: backgroundColor,
									onChange: this.onChangeBackgroundColor,
									label: __( 'Background Color', 'post-type-archive-mapping' ),
								} ] }
								>
							</PanelColorSettings>
							<PanelColorSettings
								title={ __( 'Title Color', 'post-type-archive-mapping' ) }
								initialOpen={ true }
								colorSettings={ [ {
									value: titleColor,
									onChange: this.onChangeTitleColor,
									label: __( 'Title Color', 'post-type-archive-mapping' ),
								} ] }
								>
							</PanelColorSettings>
							<PanelColorSettings
								title={ __( 'Custom Fields Color', 'post-type-archive-mapping' ) }
								initialOpen={ true }
								colorSettings={ [ {
									value: customFieldsColor,
									onChange: this.onChangeCustomFieldsColor,
									label: __( 'Custom Fields Color', 'post-type-archive-mapping' ),
								} ] }
								>
							</PanelColorSettings>
							<PanelColorSettings
								title={ __( 'Content Color', 'post-type-archive-mapping' ) }
								initialOpen={ true }
								colorSettings={ [ {
									value: contentColor,
									onChange: this.onChangeContentColor,
									label: __( 'Content Color', 'post-type-archive-mapping' ),
								} ] }
								>
							</PanelColorSettings>
							<PanelColorSettings
								title={ __( 'Link Color', 'post-type-archive-mapping' ) }
								initialOpen={ true }
								colorSettings={ [ {
									value: linkColor,
									onChange: this.onChangeLinkColor,
									label: __( 'Link Color', 'post-type-archive-mapping' ),
								} ] }
								>
							</PanelColorSettings>
							<PanelColorSettings
								title={ __( 'Continue Reading Color', 'post-type-archive-mapping' ) }
								initialOpen={ true }
								colorSettings={ [ {
									value: continueReadingColor,
									onChange: this.onChangeContinueReadingColor,
									label: __( 'Continue Reading Color', 'post-type-archive-mapping' ),
								} ] }
								>
							</PanelColorSettings>
						</PanelBody>
						<PanelBody title={ __( 'Fonts', 'post-type-archive-mapping' ) } initialOpen={false}>
							<SelectControl
								label={ __( 'Title Font', 'post-type-archive-mapping' ) }
								options={ fontOptions }
								value={ titleFont }
								onChange={ ( value ) => { this.props.setAttributes( { titleFont: value } ); } }
							/>
							<SelectControl
								label={ __( 'Custom Fields Font', 'post-type-archive-mapping' ) }
								options={ fontOptions }
								value={ customFieldsFont }
								onChange={ ( value ) => { this.props.setAttributes( { customFieldsFont: value } ); } }
							/>
							<SelectControl
								label={ __( 'Meta Font', 'post-type-archive-mapping' ) }
								options={ fontOptions }
								value={ metaFont }
								onChange={ ( value ) => { this.props.setAttributes( { metaFont: value } ); } }
							/>
							<SelectControl
								label={ __( 'Content Font', 'post-type-archive-mapping' ) }
								options={ fontOptions }
								value={ contentFont }
								onChange={ ( value ) => { this.props.setAttributes( { contentFont: value } ); } }
							/>
							<SelectControl
								label={ __( 'Continue Reading Font', 'post-type-archive-mapping' ) }
								options={ fontOptions }
								value={ continueReadingFont }
								onChange={ ( value ) => { this.props.setAttributes( { continueReadingFont: value } ); } }
							/>
						</PanelBody>
					</Fragment>
				}
			</InspectorControls>
		);
		if( this.state.loading ) {
			return (
				<Fragment>
					{ inspectorControls }
					<Placeholder>
						<div className="ptam-loading">
							<h1><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/><path d="M0 0h24v24H0z" fill="none"/></svg> {__( 'Custom Posts', 'post-type-archive-mapping' )}</h1>
							<h2>{__( 'Finding items...', 'post-type-archive-mapping' )} <Spinner /></h2>
						</div>
					</Placeholder>
				</Fragment>
			)
		}
		const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;
		if ( ! hasPosts ) {
			return (
				<Fragment>
					{ inspectorControls }
					<Placeholder
						icon="admin-post"
						label={ __( 'Custom Posts',  'post-type-archive-mapping' ) }
					>
						{ ! Array.isArray( latestPosts ) ?
							<Spinner /> :
							__( 'No posts found.',  'post-type-archive-mapping' )
						}
					</Placeholder>
				</Fragment>
			);
		}

		// Removing posts from display should be instant.
		const displayPosts = latestPosts.length > postsToShow ?
			latestPosts.slice( 0, postsToShow ) :
			latestPosts;

		const layoutControls = [
			{
				icon: 'grid-view',
				title: __( 'Grid View',  'post-type-archive-mapping' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
			{
				icon: 'list-view',
				title: __( 'List View',  'post-type-archive-mapping' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
		];

		// Styles
		let titleStyles = postLayout === 'grid' ? { textAlign: titleAlignment } : {};
		titleStyles.fontFamily = titleFont;
		let customFieldsStyles = {
			fontFamily: customFieldsFont,
			color: customFieldsColor,
			textAlign: customFieldAlignment,
		};
		let imageAlignmentStyles = postLayout === 'grid' ? { textAlign: imageAlignment } : {};
		let metaStyles = postLayout === 'grid' ? { textAlign: metaAlignment, color: contentColor } : { color: contentColor };
		metaStyles.fontFamily = metaFont;
		let contentStyles = postLayout === 'grid' ? { textAlign: contentAlignment, color: contentColor } : { color: contentColor };
		contentStyles.fontFamily = contentFont;
		let continueReadingStyles = {
			color: continueReadingColor,
			fontFamily: continueReadingFont
		};

		// Color Styles
		let 	titleColorStyles = { color: titleColor };
		let linkColorStyles = { color: linkColor };

		// Title tag
		const Titletag = titleHeadingTag;

		return (
			<Fragment>
				{ inspectorControls }
				<BlockControls>
					<BlockAlignmentToolbar
						value={ align }
						onChange={ ( value ) => {
							if ( undefined == value ) {
								value = 'wide';
							}
							setAttributes( { align: value } );
						} }
						controls={ [ 'center', 'wide' ] }
					/>
					<Toolbar controls={ layoutControls } />
				</BlockControls>
				<div
					className={ classnames(
						this.props.className,
						'ptam-block-post-grid',
					) }
				>
					<div
						className={ classnames( {
							'is-custom' : imageLocation !== 'regular',
							'is-grid': postLayout === 'grid',
							'is-list': postLayout === 'list',
							[ `columns-${ columns }` ]: postLayout === 'grid',
							'ptam-post-grid-items' : 'ptam-post-grid-items'
						} ) }
					>
						{ displayPosts.map( ( post, i ) =>
							<article
								key={ i }
								className={ classnames(
									post.featured_image_src && displayPostImage ? 'has-thumb' : 'no-thumb'
								) }
								style={ ! removeStyles ? borderPaddingStyles : {} }
							>
								{
										displayPostImage && post.featured_image_src !== undefined && post.featured_image_src  && 'regular' === this.state.imageLocation ? (
											<div className="ptam-block-post-grid-image" style={ ! removeStyles ? imageAlignmentStyles : {} }>
												<a href={ post.link } target="_blank" rel="bookmark">
												{htmlToReactParser.parse(post.featured_image_src)}
												</a>
											</div>
										) : (
											null
										)
								}

								<div className="ptam-block-post-grid-text">
									{ displayTitle &&
										<Titletag className="ptam-block-post-grid-title" style={ ! removeStyles ? titleStyles : {} }><a href={ post.link } target="_blank" rel="bookmark" style={! removeStyles ?  titleColorStyles : {} }>{ decodeEntities( post.post_title.trim() ) || __( '(Untitled)', 'post-type-archive-mapping' ) }</a></Titletag>
									}
									{displayPostImage && post.featured_image_src !== undefined && post.featured_image_src  && 'below_title' === this.state.imageLocation ? (
											<div className="ptam-block-post-grid-image" style={! removeStyles ? imageAlignmentStyles : {} }>
												<a href={ post.link } target="_blank" rel="bookmark">
												{htmlToReactParser.parse(post.featured_image_src)}
												</a>
											</div>
										) : (
											null
										)
									}

									{ displayCustomFields && 
										<div className="ptam-block-post-custom-fields" style={! removeStyles ? customFieldsStyles : {} }>
											{htmlToReactParser.parse(customFields)}
										</div>
									}

									<div className={`ptam-block-post-grid-byline ${capitilization}`} style={! removeStyles ? metaStyles : {} }>
										{ displayPostAuthor && post.author_info.display_name !== 'undefined' && post.author_info.display_name &&
											<div className="ptam-block-post-grid-author"><a className="ptam-text-link" target="_blank" href={ post.author_info.author_link } style={! removeStyles ? linkColorStyles : {} }>{ post.author_info.display_name }</a></div>
										}

										{ displayPostDate && post.post_date_gmt &&
											<time dateTime={ dayjs( post.post_date_gmt ).format() } className={ 'ptam-block-post-grid-date' }>
												{ dayjs( post.post_date_gmt ).format( 'MMMM DD, YYYY' ) }
											</time>
										}
										{ userTaxonomiesArray.length > 0 && displayTaxonomies && 'regular' === taxonomyLocation &&
											<div>
												{userTaxonomiesArray.map((key) => {
													if( post.terms[key.value] !== false ) {
														return (<div className="ptam-terms"><span className="ptam-term-label">{key.label}: </span><span className="ptam-term-values" style={linkColorStyles}>{htmlToReactParser.parse(post.terms[key.value])}</span></div>);
													}
												})}
											</div>
										}
										{
										displayPostImage && post.featured_image_src !== undefined && post.featured_image_src  && 'below_title_and_meta' === this.state.imageLocation ? (
											<div className="ptam-block-post-grid-image" style={! removeStyles ? imageAlignmentStyles : {} }>
												<a href={ post.link } target="_blank" rel="bookmark">
												{htmlToReactParser.parse(post.featured_image_src)}
												</a>
											</div>
											) : (
											null
											)
										}
									</div>

									<div className="ptam-block-post-grid-excerpt" style={! removeStyles ? contentStyles : {} }>
										{ displayPostExcerpt && '' !==  post.post_excerpt &&
											<Fragment>
												{this.excerptParse(post.post_excerpt)}
											</Fragment>
										}

										{ displayPostLink &&
											<p><a className="ptam-block-post-grid-link ptam-text-link" href={ post.link } target="_blank" rel="bookmark" style={! removeStyles ? continueReadingStyles : {} }>{ readMoreText }</a></p>
										}
										{
										displayPostImage && post.featured_image_src !== undefined && post.featured_image_src  && 'bottom' === this.state.imageLocation ? (
												<div className="ptam-block-post-grid-image" style={! removeStyles ? imageAlignmentStyles : {} }>
													<a href={ post.link } target="_blank" rel="bookmark">
													{htmlToReactParser.parse(post.featured_image_src)}
													</a>
												</div>
											) : (
												null
											)
										}
									</div>
									{ userTaxonomiesArray.length > 0 && displayTaxonomies && 'below_content' === taxonomyLocation &&
											<div style={metaStyles}>
												{userTaxonomiesArray.map((key) => {
													if( post.terms[key.value] !== false ) {
														return (<div className="ptam-terms"><span className="ptam-term-label">{key.label}: </span><span className="ptam-term-values" style={! removeStyles ? linkColorStyles : {} }>{htmlToReactParser.parse(post.terms[key.value])}</span></div>);
													}
												})}
											</div>
										}
								</div>
							</article>
						) }
					</div>
				</div>
			</Fragment>
		);
	}
}

export default PTAM_Custom_Posts;