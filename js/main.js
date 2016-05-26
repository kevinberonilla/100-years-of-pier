var page = $('html, body'),
    body = $('body'),
    isDev = false; // Set this to false before pushing to production

$(document).ready(function() {
    /* ----------------------------------------
    Preload Auto-Populate Functions
    ---------------------------------------- */
    function autoPopulatePreload() {
        body.prepend('<div id="preload"></div>');
        
        var preload = $('#preload');
        
        $('[data-background-image]').each(function() {
            var imageUrl = $(this).data('background-image');
            
            preload.append('<img src="' + imageUrl + '" alt="">');
        });
        $('[style*="background-image"]').each(function() {
            var imageUrl = $(this).attr('style').replace('background-image: url(', '').replace(')', '').replace(';', '');
            
            preload.append('<img src="' + imageUrl + '" alt="">');
        });
    }
    
    $.when(autoPopulatePreload()).done(beginLoading);
    
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
        isMobile = false,
        scrollPos,
        adjustedPos,
        videoOffset,
        windowHeight,
        userAgentString = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i;
    
    if (userAgentString.test(navigator.userAgent)) { // Don't load the video for tablet portrait and smaller
        videoBackground.find('source')
            .remove();
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
    Page Load Functions
    ---------------------------------------- */
    function beginLoading() {
        var image =  $('img'),
            audioVideo = $('audio, video'),
            total = media.length + audioVideo.length,
            loadingBar = $('#loading-bar'),
            loaded = 0,
            loadingPercentage = $('#loading-percentage .number');
        
        function processLoadedMedia() {
            loaded ++;
            var percentage = parseInt((loaded / total) * 100);
            
            loadingBar.css('width', percentage + '%');
            loadingPercentage.text(percentage);
        }
        
        media.load(processLoadedMedia);
        
        audioVideo.each(function() {
            $(this).get()
                .oncanplaythrough(processLoadedMedia);
        });
        
        $(window).load(function() {
            var homeVideo = $('#home-video'),
                scrollMessage = $('.scroll-message');
            
            loadingBar.css('width', '100%');
            loadingPercentage.text('100');
            
            setTimeout(function() {
                body.addClass('loaded');
                homeVideo.addClass('show');
            }, 250);
            
            setTimeout(function() {
                body.trigger('pageready.np'); // Custom namespaced event to initialized one page scroll
            }, (isDev) ? 0 : 2000);
            
            setTimeout(function() {
                scrollMessage.addClass('show');
            }, 3000);
        });
    }
    
    /* ----------------------------------------
    Quote Background Image Functions
    ---------------------------------------- */
    var quoteBackgroundImage = $('.quote-background-image');
    
    function resizeQuoteBackgroundImages() {
        var windowWidth = $(window).width();
        
        quoteBackgroundImage.each(function() {
            var self = $(this),
                containerWidth = self.closest('.container').width(),
                delta = windowWidth - containerWidth;
            
            self.css({
                'left': '-' + (delta / 2) + 'px',
                'right': '-' + (delta / 2) + 'px'
            });
        });
    }
    
    resizeQuoteBackgroundImages();
    $(window).resize($.debounce(500, resizeQuoteBackgroundImages));
    
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
    
    function calculateNavEntryHeight() {
        var currentWindowHeight = $(window).height(),
            linkHeight = (currentWindowHeight / linkCount);
        
        navEntry.css('height', linkHeight + 'px');
    }
    
    function openNav() {
        body.addClass('nav-open')
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
        body.removeClass('nav-open')
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
    
    calculateNavEntryHeight();
    $(window).resize(calculateNavEntryHeight);
    openNavButton.click(openNav);
    closeNavButton.click(closeNav);
    
    /* ----------------------------------------
    Sub-Nav Functions
    ---------------------------------------- */
    var subNavEntry = $('#sub-nav > ul > li'),
        subNavLink = $('a', subNavEntry),
        positionIndicator = $('#position-indicator'),
        section = $('#main section:not(#home)'),
        sectionArray = [],
        sectionCount = 1;
    
    for (var i = 0; i < section.length; i++) {
        var currentSection = section.eq(i);
        
        if (currentSection.hasClass('end')) {
            if (currentSection.is(':last-child')) sectionCount--;
            
            sectionArray.push(sectionCount);
            sectionCount = 1;
        }
        else sectionCount++;
    }
    
    function findIndex(element, jQueryArray) {
        var value;
        
        for (var i = 0; i < jQueryArray.length; i++) {
            var iteratedElement = jQueryArray.eq(i);
            
            if (element.is(iteratedElement)) {
                value = i;
                break;
            };
        }
        
        return value;
    }
    
    function resizePositionIndicator(currentSection) {
        var isIntro = $(currentSection).hasClass('has-intro'),
            introSection = $('section[id*="section"]'),
            homeSection = $('#home'),
            currentSectionIndex,
            height;
        
        if (isIntro) {
            currentSectionIndex = findIndex(currentSection, introSection);
            
            height = (currentSectionIndex / introSection.length) * 100 + '%';
        } else if (!currentSection.is(homeSection)) {
            currentSectionIndex = findIndex(currentSection, section);
            
            var closestIntro = section.eq(currentSectionIndex).prevAll('.has-intro').first(),
                closestIntroId = closestIntro.attr('id'),
                introSectionIndex = findIndex(closestIntro, section),
                relativeIntroSectionIndex = findIndex(closestIntro, introSection),
                introSectionHeight = (relativeIntroSectionIndex / introSection.length) * 100,
                currentSectionIndex = findIndex(currentSection, section),
                relativeSectionHeight = (((currentSectionIndex - introSectionIndex) / sectionArray[relativeIntroSectionIndex]) / introSection.length) * 100;
            
            height = introSectionHeight + relativeSectionHeight + '%';
        } else {
            height = 0;
        }
        positionIndicator.css('height', height);
    }
    
    subNavLink.click(function(e) {
        e.preventDefault();
        
        var href = $(this).attr('href'),
            index = $(href).index() + 1;
        
        main.moveTo(index);
    });
    
    
    /* ----------------------------------------
    Home Link Functions
    ---------------------------------------- */
    var homeLink = $('.logo-container.horizontal > a');
    
    homeLink.click(function() {
        main.moveTo(1)
    });
    
    /* ----------------------------------------
    Content Reveal Functions
    ---------------------------------------- */
    function processAnimateIn(section) {
        var animateIn = $('.animate-in', section);
        
        animateIn.each(function() {
            var self = $(this),
                index = self.index();
            
            function setDelays() {
                if (index != 0 && !self.is('[data-delay]')) {
                    self.attr('data-delay', index + '00');
                }
            }
            
            $.when(setDelays()).done(function() {
                var delay = self.data('delay') || 0;
                
                setTimeout(function() {
                    self.addClass('reveal');
                }, delay);
            });
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
        backgroundImage = $('#background-image'),
        clouds = $('#clouds'),
        homeVideo = $('#home-video'),
        backgroundVideo = $('#background-video'),
        title = $('#home #title'),
        horizontalLogo = $('.logo-container.horizontal'),
        activeSection;
    
    function processBeforeMove() {
        activeSection = $('section.active');
        
        // If is home
        if (activeSection.is('#home')) {
            homeVideo.addClass('show');
            horizontalLogo.removeClass('show');
        } else {
            homeVideo.removeClass('show');
        }
        
        // If has overlay
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
        
        // If has underlay
        if (activeSection.hasClass('has-underlay')) {
            var underlayUrl = activeSection.data('underlay-background');
            
            underlay.css('background-image', 'url(' + underlayUrl + ')')
                .addClass('show');
            horizontalLogo.removeClass('show');
        } else {
            underlay.removeClass('show');
        }
        
        // If has background image
        if (activeSection.hasClass('has-background-image')) {
            var backgroundImageUrl = activeSection.data('background-image');
            
            backgroundImage.css('background-image', 'url(' + backgroundImageUrl + ')')
                .addClass('show');
        } else {
            backgroundImage.removeClass('show');
        }
        
        // If is not home, does not have overlay, and does not have underlay
        if (!activeSection.is('#home') && !activeSection.hasClass('has-overlay') && !activeSection.hasClass('has-underlay')) {
            horizontalLogo.addClass('show');
            backgroundVideo.addClass('show');
        } else {
            backgroundVideo.removeClass('show');
        }
        
        resizePositionIndicator(activeSection);
    }
    
    function processAfterMove() {
        processAnimateIn(activeSection);
    }
    
    body.on('pageready.np', function() {
        $('#main').onepage_scroll({
            sectionContainer: 'section',
            easing: 'ease',
            animationTime: (isDev) ? 100 : 1000,
            keyboard: true,
            direction: 'vertical',
            pagination: false,
            loop: false,
            beforeMove: processBeforeMove,
            afterMove: processAfterMove
        });
    });
    
    /* ----------------------------------------
    Timeline Functions
    ---------------------------------------- */
    var timelineEntryStart = $('.timeline-entry.start'),
        timelineEntryEnd = $('.timeline-entry.end'),
        timelineMarkOffset = 30,
        timelineContentPaddingTop = 20;
    
    function calculateTimelineBorders() {
        timelineEntryStart.each(function() {
            var contentOffsetTop = $(this).find('.timeline-content').offset().top,
                parentOffsetTop = $(this).closest('section').offset().top,
                position = contentOffsetTop - parentOffsetTop + timelineMarkOffset + timelineContentPaddingTop,
                timelineBorder = $('.timeline-border', this);
            
            timelineBorder.css('top', position + 'px');
        });
        
        timelineEntryEnd.each(function() {
            var lastBodyHeight = $(this).find('.timeline-body').last().height(),
                contentHeight = $(this).find('.timeline-content').innerHeight(),
                parentHeight = ($(this).closest('section').height() > 560) ? $(this).closest('section').height() : 560,
                galleryHeight = $(this).find('.timeline-gallery').outerHeight(true),
                sliderHeight = $(this).find('.timeline-slider').outerHeight(true),
                position = ((parentHeight - contentHeight) / 2) + lastBodyHeight + galleryHeight + sliderHeight - timelineMarkOffset,
                timelineBorder = $('.timeline-border', this);
            
            timelineBorder.css('bottom', position + 'px');
        });
    }
    $(window).load(calculateTimelineBorders);
    $(window).resize($.debounce(750, calculateTimelineBorders));
    
    /* ----------------------------------------
    Gallery Type A Functions
    ---------------------------------------- */
    var galleryTypeA = $('.gallery.type-a'),
        galleryPaddingTotal = (matchMedia('only screen and (max-width: 1024px)').matches) ? 80 : 0,
        containerWidth = galleryTypeA.closest('.container').width();

    galleryTypeA.each(function() {
        var self = $(this),
            galleryEntry = $('.gallery-entry', self),
            firstGalleryEntry = galleryEntry.first(),
            numberOfEntries = galleryEntry.length;

        self.Cloud9Carousel({
            autoPlay: 0,
            bringToFront: true,
            smooth: true,
            transforms: true,
            speed: 250,
            itemClass: 'gallery-entry',
            yRadius: -25,
            xRadius: (containerWidth - galleryPaddingTotal) / (numberOfEntries - 1)
        });

        firstGalleryEntry.addClass('active');

        galleryEntry.click(function() {
            galleryEntry.removeClass('active');
            $(this).addClass('active');
        });

        function recalculateWidths() {
            galleryEntry.unbind()
                .removeClass('active')
                .removeAttr('style');

            galleryPaddingTotal = (matchMedia('only screen and (max-width: 1024px)').matches) ? 80 : 0;
            containerWidth = galleryTypeA.closest('.container').width();

            self.Cloud9Carousel({
                autoPlay: 0,
                bringToFront: true,
                smooth: true,
                transforms: true,
                speed: 250,
                itemClass: 'gallery-entry',
                yRadius: -25,
                xRadius: (containerWidth - galleryPaddingTotal) / (numberOfEntries - 1)
            });

            firstGalleryEntry.addClass('active');

            galleryEntry.click(function() {
                galleryEntry.removeClass('active');
                $(this).addClass('active');
            });
        }

        $(window).resize($.debounce(500, recalculateWidths));
    });
    
    /* ----------------------------------------
    Gallery Type B Functions
    ---------------------------------------- */
    var galleryTypeB = $('.gallery.type-b');

    galleryTypeB.each(function() {
        var self = this,
            galleryEntry = $('> li', self),
            galleryEntryCount = galleryEntry.length,
            galleryClosedWidth = (matchMedia('only screen and (max-width: 1024px)').matches) ? 60 : 140,
            totalMarginWidth = 10,
            containerWidth = $(self).closest('.container').width(),
            galleryPaddingTotal = (matchMedia('only screen and (max-width: 1024px)').matches) ? 80 : 0,
            galleryOpenWidth = containerWidth - ((galleryEntryCount - 1) * (galleryClosedWidth + totalMarginWidth)) - totalMarginWidth - galleryPaddingTotal;

        galleryEntry.click(function() {
            galleryEntry.removeClass('active')
                .css('width', '');

            $(this).addClass('active')
                .css('width', galleryOpenWidth + 'px');
        });

        function recalculateWidths() {
            galleryClosedWidth = (matchMedia('only screen and (max-width: 1024px)').matches) ? 60 : 140;
            containerWidth = $(self).closest('.container').width();
            galleryPaddingTotal = (matchMedia('only screen and (max-width: 1024px)').matches) ? 80 : 0;
            galleryOpenWidth = containerWidth - ((galleryEntryCount - 1) * (galleryClosedWidth + totalMarginWidth)) - totalMarginWidth - galleryPaddingTotal;

            $('> li.active', self).css('width', galleryOpenWidth + 'px');
        }

        $(window).resize($.debounce(500, recalculateWidths));

        galleryEntry.first()
            .click(); // Set initial state
    });
    
    /* ----------------------------------------
    Desktop Gallery Drag Functions
    ---------------------------------------- */
    if (!isMobile) {
        var gallery = $('.gallery'),
            cursorYPos = 0,
            cursorXPos = 0,
            cursorDown = false;
        
        gallery.on('mousemove', function(e) {
            if (cursorDown === true) {
                $(this).scrollTop(parseInt($(this).scrollTop() + (cursorYPos - e.offsetY)));
                $(this).scrollLeft(parseInt($(this).scrollLeft() + (cursorXPos - e.offsetX)));
            }
        });
        
        gallery.on('mousedown', function(e) {
            cursorDown = true;
            cursorYPos = e.offsetY;
            cursorXPos = e.offsetX;
            e.preventDefault();
        });
        gallery.on('mouseup', function() {
            cursorDown = false;
        });
        
        // Stop dragging if mouse leaves the window (Not essential, can be removed without negative effects)
        gallery.on('mouseout', function() {
            cursorDown = false;
        });
    }
    
    /* ----------------------------------------
    Slider Functions
    ---------------------------------------- */
    var slider = $('.slider'),
        sliderSection = $('section.has-slider');
    
    $(window).load(function() {
        $.when(slider.twentytwenty()).done(function() {
            setTimeout(function() { // Allow time for plugin to initialize
                slider.each(function() {
                    var self = this,
                        beforeText = $(self).data('before-text') || 'Before',
                        afterText = $(self).data('after-text') || 'After',
                        handle = $('.twentytwenty-handle', self),
                        labels = $('.twentytwenty-before-label, .twentytwenty-after-label', self);
                    
                    labels.remove();
                    handle.append('<div class="twentytwenty-before-label">' + beforeText + '</div>', '<div class="twentytwenty-after-label">' + afterText + '</div>');
                });
                
                $(this).trigger('resize'); // Ensures timeline resizing functions can calculate this height after load
            }, 1000);
        });
    });
    
    /* ----------------------------------------
    Quote Image Functions
    ---------------------------------------- */
    var quoteImageContainer = $('.quote-image-container');
    
    function centerQuoteImages() {
        quoteImageContainer.each(function() {
            var self = $(this),
                quoteImage = $('.quote-image', self),
                containerWidth = self.width(),
                containerHeight = self.height(),
                imageWidth = quoteImage.width(),
                imageHeight = quoteImage.height(),
                widthDelta = containerWidth - imageWidth,
                heightDelta = containerHeight - imageHeight,
                offsetX = quoteImage.data('offset-x') || 0,
                offsetY = quoteImage.data('offset-y') || 0;

            quoteImage.css({
                'left': (widthDelta / 2) + offsetX + 'px',
                'top': (heightDelta / 2) + offsetY + 'px'
            });
        });
    }
    
    function hideQuoteBody() {
        var target = $('section.active .quote-body .animate-in');
        
        target.removeClass('reveal');
    }
    
    function showQuoteBody() {
        var target = $('section.active .quote-body .animate-in');
        
        target.addClass('reveal');
    }
    
    quoteImageContainer.hover(hideQuoteBody, showQuoteBody);
    
    $(window).resize($.debounce(500, centerQuoteImages));
    $(window).load(centerQuoteImages);
    
    /* ----------------------------------------
    Music Functions
    ---------------------------------------- */
    var musicIcon = $('#music-icon');
    
    musicIcon.click(function() {
        if ($(this).hasClass('fa-volume-up')) {
            $(this).removeClass('fa-volume-up')
                .addClass('fa-volume-off')
                .addClass('adjust-p-r-6');
        } else {
            $(this).removeClass('fa-volume-off')
                .removeClass('adjust-p-r-6')
                .addClass('fa-volume-up');
        }
    });
});