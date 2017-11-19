'use strict';

jQuery.fn.exists = function () {
    return this.length > 0;
};

let frameSlider = {
    slider: $('.js-frame-carousel'),
    sliderSettings: () => {
        return {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            focusOnSelect: false,
            arrows: true,
            dots: true,
            speed: 500
        }
    },
    init: () => {
        let slider;
        if (frameSlider.slider.exists()) {
            slider = frameSlider.slider.slick(frameSlider.sliderSettings());
        }
    }
};

$(function () {
    frameSlider.init();
});
