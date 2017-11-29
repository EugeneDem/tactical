'use strict';
var frameSlider = {
	slider: $('.js-frame-carousel'),
	sliderSettings: function sliderSettings() {
		return {
			slidesToShow: 1,
			slidesToScroll: 1,
			infinite: true,
			focusOnSelect: false,
			arrows: true,
			dots: true,
			speed: 500
		};
	},
	init: function init() {
		var slider = void 0;
		if (frameSlider.slider.length) {
			slider = frameSlider.slider.slick(frameSlider.sliderSettings());
		}
	}
};
var productZoomCarousel = {
	slider: $('.js-product-zoom'),
	sliderSettings: function sliderSettings() {
		return {
			dots: true,
			arrows: false,
			infinite: true,
			speed: 500,
			fade: true,
			focusOnSelect: false,
			lazyLoad: "ondemand",
			cssEase: "linear",
			adaptiveHeight: true,
			mobileFirst: true,
			centerMode: true,
			responsive: [{
				breakpoint: 767,
				settings: {
					arrows: false,
					dots: true,
					customPaging: function customPaging(slider, i) {
						var item = $(slider.$slides[i]).find("img");
						return '<button class="product-zoom__tab"><img class="img-thumbnail" src="' + item.attr("data-thumb") + '" alt="' + item.attr("data-alt-thumb") + '"></button>';
					}
				}
			}]
		};
	},
	init: function init() {
		if ($('.product-zoom').length) {
			productZoomCarousel.slider.slick(productZoomCarousel.sliderSettings());
		}
	}
};
var initPhotoSwipeFromDOM = function initPhotoSwipeFromDOM(gallerySelector) {
	var parseThumbnailElements = function parseThumbnailElements(el) {
		var thumbElements = el.childNodes,
			numNodes = thumbElements.length,
			items = [],
			figureEl = void 0,
			linkEl = void 0,
			size = void 0,
			item = void 0;
		for (var i = 0; i < numNodes; i++) {
			figureEl = thumbElements[i]; // <figure> element
			// include only element nodes 
			if (figureEl.nodeType !== 1) {
				continue;
			}
			linkEl = figureEl.children[0]; // <a> element
			size = linkEl.getAttribute('data-size').split('x'); // create slide object
			item = {
				src: linkEl.getAttribute('href'),
				w: parseInt(size[0], 10),
				h: parseInt(size[1], 10),
				alt: linkEl.getAttribute("data-alt-zoom")
			};
			if (figureEl.children.length > 1) { // <figcaption> content
				item.title = figureEl.children[1].innerHTML;
			}
			if (linkEl.children.length > 0) { // <img> thumbnail element, retrieving thumbnail url
				item.msrc = linkEl.children[0].getAttribute('src');
			}
			item.el = figureEl; // save link to element for getThumbBoundsFn
			items.push(item);
		}
		return items;
	}; // find nearest parent element
	var closest = function closest(el, fn) {
		return el && (fn(el) ? el : closest(el.parentNode, fn));
	}; // triggers when user clicks on thumbnail
	var onThumbnailsClick = function onThumbnailsClick(e) {
		e = e || window.event;
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
		var eTarget = e.target || e.srcElement; // find root element of slide
		var clickedListItem = closest(eTarget, function(el) {
			return el.tagName && el.tagName.toUpperCase() === 'FIGURE';
		});
		if (!clickedListItem) {
			return;
		} // find index of clicked item by looping through all child nodes
		// alternatively, you may define index via data- attribute
		var clickedGallery = clickedListItem.parentNode,
			childNodes = clickedListItem.parentNode.childNodes,
			numChildNodes = childNodes.length,
			nodeIndex = 0,
			index = void 0;
		for (var i = 0; i < numChildNodes; i++) {
			if (childNodes[i].nodeType !== 1) {
				continue;
			}
			if (childNodes[i] === clickedListItem) {
				index = nodeIndex;
				break;
			}
			nodeIndex++;
		}
		var link = $(clickedListItem).find("a").attr("href");
		if (index >= 0 && link !== undefined) { // open PhotoSwipe if valid index found
			openPhotoSwipe(index, clickedGallery);
		}
		return false;
	}; // parse picture index and gallery index from URL (#&pid=1&gid=2)
	var photoswipeParseHash = function photoswipeParseHash() {
		var hash = window.location.hash.substring(1),
			params = {};
		if (hash.length < 5) {
			return params;
		}
		var vars = hash.split('&');
		for (var i = 0; i < vars.length; i++) {
			if (!vars[i]) {
				continue;
			}
			var pair = vars[i].split('=');
			if (pair.length < 2) {
				continue;
			}
			params[pair[0]] = pair[1];
		}
		if (params.gid) {
			params.gid = parseInt(params.gid, 10);
		}
		return params;
	};
	var openPhotoSwipe = function openPhotoSwipe(index, galleryElement, disableAnimation, fromURL) {
		var pswpElement = document.querySelectorAll('.pswp')[0],
			gallery = void 0,
			options = void 0,
			items = void 0;
		items = parseThumbnailElements(galleryElement); // define options (if needed)
		options = { // barsSize: {
			//     top: 0,
			//     bottom: 0
			// },
			closeEl: true,
			captionEl: false,
			fullscreenEl: true,
			shareEl: false,
			tapToToggleControls: false,
			history: false,
			zoomEl: true,
			focus: false,
			counterEl: false,
			arrowEl: false, // scaleMode: "orig",
			// define gallery index (for URL)
			galleryUID: galleryElement.getAttribute('data-pswp-uid'),
			getThumbBoundsFn: function getThumbBoundsFn(index) { // See Options -> getThumbBoundsFn section of documentation for more info
				var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
					pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
					rect = thumbnail.getBoundingClientRect();
				return {
					x: rect.left,
					y: rect.top + pageYScroll,
					w: rect.width
				};
			}
		}; // PhotoSwipe opened from URL
		if (fromURL) {
			if (options.galleryPIDs) { // parse real index when custom PIDs are used 
				// http://photoswipe.com/documentation/faq.html#custom-pid-in-url
				for (var j = 0; j < items.length; j++) {
					if (items[j].pid == index) {
						options.index = j;
						break;
					}
				}
			} else { // in URL indexes start from 1
				options.index = parseInt(index, 10) - 1;
			}
		} else {
			options.index = parseInt(index, 10);
		} // exit if index not found
		if (isNaN(options.index)) {
			return;
		}
		if (disableAnimation) {
			options.showAnimationDuration = 0;
		} // Pass data to PhotoSwipe and initialize it
		gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
		window.gallery = gallery;
		gallery.init();
	}; // loop through all gallery elements and bind events
	var galleryElements = document.querySelectorAll(gallerySelector);
	for (var i = 0, l = galleryElements.length; i < l; i++) {
		galleryElements[i].setAttribute('data-pswp-uid', i + 1);
		galleryElements[i].onclick = onThumbnailsClick;
	} // Parse URL and open gallery if it contains #&pid=3&gid=1
	var hashData = photoswipeParseHash();
	if (hashData.pid && hashData.gid) {
		openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
	}
};
$(function() {
	frameSlider.init();
	productZoomCarousel.init();
	initPhotoSwipeFromDOM('.product-zoom');
});
