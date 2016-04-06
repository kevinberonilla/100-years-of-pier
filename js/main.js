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
        blurElements = $('#underlay, #clouds, .video-background'),
        main = $('.main');
    
    function calculatenavEntryHeight() {
        var currentWindowHeight = $(window).height(),
            linkHeight = (currentWindowHeight / linkCount);
        
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
        
        setTimeout(function() {
            blurElements.addClass('blur');
        }, 250);
    }
    
    function closeNav() {
        $('body').removeClass('nav-open')
            .removeClass('disable-scroll');
        
        navEntry.removeClass('show');
        
        setTimeout(function() {
            blurElements.removeClass('blur');
        }, 150);
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
    Content Reveal Functions
    ---------------------------------------- */
    function processAnimateIn(section) {
        var animateIn = $('.animate-in', section);
        
        animateIn.each(function() {
            var self = $(this),
                delay = self.data('delay') || 0;
            
            setTimeout(function() {
                self.addClass('reveal');
            }, delay);
        });
    }
    
    /* ----------------------------------------
    Parallax Functions
    ---------------------------------------- */
    var cloudsList = $('#clouds'),
        cloudParallax;
    
    function enableCloudParallax() {
        if (typeof(cloudParallax) === 'undefined') {
            cloudParallax = cloudsList.parallax();
        } else {
            cloudParallax.parallax('enable');
        }
    }
    
    function disableCloudParallax() {
        if (typeof(cloudParallax) !== 'undefined') {
            cloudParallax.parallax('disable');
        }
    }
    
    /* ----------------------------------------
    One Page Scroll Functions
    ---------------------------------------- */
    var underlay = $('#underlay'),
        overlay = $('#overlay'),
        clouds = $('#clouds'),
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
            clouds.addClass('show');
            horizontalLogo.removeClass('show');
            
            enableCloudParallax();
        } else {
            overlay.removeClass('show');
            clouds.removeClass('show');
            
            disableCloudParallax();
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
        
        setTimeout(function() {
            processAnimateIn(activeSection);
        }, 1000);
    }
    
    function processAfterMove() {
        // afterMove functions go here
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
        afterMove: processAfterMove
    });
    
    /* ----------------------------------------
    Timeline Functions
    ---------------------------------------- */
    var timelineEntryStart = $('.timeline-entry.start'),
        timelineEntryEnd = $('.timeline-entry.end'),
        timelineMarkOffset = 10;
    
    function calculateTimelineBorders() {
        timelineEntryStart.each(function() {
            var contentOffsetTop = $(this).find('.timeline-body').offset().top,
                parentOffsetTop = $(this).closest('section').offset().top,
                delta = contentOffsetTop - parentOffsetTop + timelineMarkOffset,
                timelineBorder = $('.timeline-border', this);
            
            timelineBorder.css('top', delta + 'px');
        });
        
        timelineEntryEnd.each(function() {
            var contentOffsetTop = $(this).find('.timeline-body').offset().top,
                parentOffsetTop = $(this).closest('section').offset().top,
                contentHeight = $(this).find('.timeline-body').height(),
                delta = (contentOffsetTop + contentHeight) - parentOffsetTop - timelineMarkOffset,
                timelineBorder = $('.timeline-border', this);
            
            timelineBorder.css('bottom', delta + 'px');
        });
    }
    
    calculateTimelineBorders();
    $(window).resize($.debounce(250, calculateTimelineBorders));
    
    /* ----------------------------------------
    Music Functions
    ---------------------------------------- */
    var musicIcon = $('#music-icon');
    
    musicIcon.click(function() {
        if ($(this).hasClass('fa-volume-up')) {
            $(this).removeClass('fa-volume-up')
                .addClass('fa-volume-off');
        } else {
            $(this).removeClass('fa-volume-off')
                .addClass('fa-volume-up');
        }
    });
});