'use strict';
jQuery.fn.exists = function() {
	return this.length > 0;
};
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
		if (frameSlider.slider.exists()) {
			slider = frameSlider.slider.slick(frameSlider.sliderSettings());
		}
	}
};
$(function() {
	frameSlider.init();
});
