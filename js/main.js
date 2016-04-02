var page = $('html, body');

$(document).ready(function() {
    /* ----------------------------------------
    Page Load Functions
    ---------------------------------------- */
    $(window).load(function() {
        var body = $('body'),
            videoBackground = $('.video-background');
        
        body.addClass('loaded');
        videoBackground.addClass('show');
    });
    
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
    Video Background Functions
    ---------------------------------------- */    
    var videoBackground = $('.video-background'),
        isMobile,
        scrollPos,
        adjustedPos,
        videoOffset,
        windowHeight;
    
    if (matchMedia('only screen and (max-width: 768px)').matches) { // Don't load the video for tablet portrait and smaller
        videoBackground.remove();
        isMobile = true;
    }
    
    function setCenter() {
        videoBackground.each(function() {
            var pageWidth = page.width(),
                pageHeight = page.height(),
                videoBackgroundWidth = $(this).width(),
                videoBackgroundHeight = $(this).height(),
                newPosX = (pageWidth / 2) - (videoBackgroundWidth / 2) + 'px',
                newPosY = (pageHeight / 2) - (videoBackgroundHeight / 2) + 'px';
            
            $(this).css({
                'left': newPosX,
                'top': newPosY
            });
        });
    }
    
    function playVideo() {
        videoBackground.each(function() {
            $(this).get(0).play();
        });
    }
    
    $(window).resize(setCenter);
    $(window).load(setCenter);
    
    if (!isMobile && videoBackground.length > 0) {
        $(window).load(playVideo);
    }
    
    /* ----------------------------------------
    Nav Functions
    ---------------------------------------- */
    var navEntry = $('nav > ul > li'),
        navLink = $('a', navEntry),
        linkCount = navEntry.length,
        openNavButton = $('#open-nav-button'),
        closeNavButton = $('#close-nav-button'),
        main = $('.main');
    
    function calculatenavEntryHeight() {
        var currentWindowHeight = $(window).height(),
            linkHeight = (currentWindowHeight / linkCount) - 1;
        
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
            index = $(href).index() + 1;
        
        closeNav();
        
        main.moveTo(index);
    });
    
    calculatenavEntryHeight();
    $(window).resize(calculatenavEntryHeight);
    openNavButton.click(openNav);
    closeNavButton.click(closeNav);
    
    /* ----------------------------------------
    One Page Scroll Functions
    ---------------------------------------- */
    var underlay = $('#underlay'),
        overlay = $('#overlay'),
        homeVideo = $('#home-video'),
        backgroundVideo = $('#background-video'),
        title = $('#home #title'),
        horizontalLogo = $('.logo-container.horizontal');
    
    function processBeforeMove() {
        var activeSection = $('section.active');
        
        if (activeSection.is('#home')) {
            homeVideo.addClass('show');
            horizontalLogo.removeClass('show');
        } else {
            homeVideo.removeClass('show');
        }
        
        if (activeSection.hasClass('has-overlay')) {
            overlay.addClass('show');
            horizontalLogo.removeClass('show');
        } else {
            overlay.removeClass('show');
        }
        
        if (activeSection.hasClass('has-underlay')) {
            var underlayBackground = activeSection.data('underlay-background');
            
            underlay.css('background-image', 'url(' + underlayBackground + ')')
                .addClass('show');
            horizontalLogo.removeClass('show');
        } else {
            underlay.removeClass('show');
        }
        
        if (!activeSection.is('#home') && !activeSection.hasClass('has-overlay') && !activeSection.hasClass('has-underlay')) {
            horizontalLogo.addClass('show');
        }
    }
    
    $('#main').onepage_scroll({
        sectionContainer: 'section',
        easing: 'ease',
        animationTime: 1000,
        keyboard: true,
        direction: 'vertical',
        pagination: false,
        loop: false,
        beforeMove: processBeforeMove,
        afterMove: function() { console.log('afterMove'); }
    });
});