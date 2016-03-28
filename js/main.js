var page = $('html, body');

$(document).ready(function() {
    /* ----------------------------------------
    Page Load Functions
    ---------------------------------------- */
    $(window).load(function() {
        var homeTitle = $('#home .title');
        
        homeTitle.animate({
            width: '600px'
        }, 1000);
        
        $('body').addClass('loaded');
    });
    
    /* ----------------------------------------
    Full Screen Height Functions
    ---------------------------------------- */
    var fullScreenHeight = $('.full-screen-height'),
        doubleScreenHeight = $('.double-screen-height'),
        firstSection = $('#home + section'),
        windowWidth = $(window).width(),
        windowHeight = $(window).height();
    
    function recalculateFullScreenHeight(multiplier) {
        var newWindowWidth = $(window).width();
        
        if (windowWidth != newWindowWidth) {
            windowWidth = newWindowWidth;
            
            windowHeight = $(window).height();
            
            fullScreenHeight.css('min-height', windowHeight + 'px');
            doubleScreenHeight.css('min-height', (windowHeight * 2) + 'px');
            firstSection.css('margin-top', windowHeight + 'px');
        }
    }
    
    fullScreenHeight.css('min-height', windowHeight + 'px');
    doubleScreenHeight.css('min-height', (windowHeight * 2) + 'px');
    firstSection.css('margin-top', windowHeight + 'px');
    $(window).resize(recalculateFullScreenHeight);
    
    /* ----------------------------------------
    Full Parent Height Functions
    ---------------------------------------- */
    var fullParentHeight = $('.full-parent-height');
    
    function calculateFullParentHeight() {
        var windowHeight = $(window).height();
        
        fullParentHeight.css('height', windowHeight + 'px');
    }
    
    calculateFullParentHeight();
    $(window).resize(calculateFullParentHeight);
    
    /* ----------------------------------------
    Nav Functions
    ---------------------------------------- */
    var navEntry = $('nav > ul > li'),
        navLink = $('a', navEntry),
        linkCount = navEntry.length,
        openNavButton = $('#open-nav-button'),
        closeNavButton = $('#close-nav-button');
    
    function calculatenavEntryHeight() {
        var linkHeight = (windowHeight / linkCount) - 1;
        
        navEntry.css('height', linkHeight + 'px');
    }
    
    function openNav() {
        $('body').addClass('nav-open')
            .addClass('disable-scroll');
        
        navEntry.each(function() {
            var self = this,
                index = $(self).index();
            
            setTimeout(function() {
                $(self).addClass('show');
            }, (index + 1) * 75);
        });
    }
    
    function closeNav() {
        $('body').removeClass('nav-open')
            .removeClass('disable-scroll');
        
        navEntry.removeClass('show');
    }
    
    navLink.click(function(e) {
        e.preventDefault();
        
        var href = $(this).attr('href'),
            targetPos = $(href).offset().top;
        
        closeNav();
        
        setTimeout(function() {
            page.animate({
                scrollTop: targetPos
            }, 1250);
        }, 250)
    });
    
    page.on('scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove', function() { // Prevent scroll hijacking
        page.stop();
    });
    
    calculatenavEntryHeight();
    $(window).resize(calculatenavEntryHeight);
    openNavButton.click(openNav);
    closeNavButton.click(closeNav);
    
    /* ----------------------------------------
    Home Scroll Functions
    ---------------------------------------- */
    var home = $('#home');
    
    function adjustOpacity() {
        var multiplier = multiplier || 1,
            scrollPos = $(window).scrollTop();
        
        if (scrollPos <= windowHeight) {
            home.css('opacity', ((windowHeight - scrollPos) / 1000));
            console.log('scroll');
        }
    }
    
    $(window).scroll(function() {
        requestAnimationFrame(adjustOpacity);
    });
    
    adjustOpacity();
});