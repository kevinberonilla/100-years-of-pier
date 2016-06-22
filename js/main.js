var page = $('html, body'),
    body = $('body'),
    isMobile = false,
    isDev = false, // Set this to false before pushing to production
    mobileUserAgentString = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i;
    
    if (mobileUserAgentString.test(navigator.userAgent)) {
        isMobile = true;
    }

$(document).on('touchmove', function(e) { // Prevent overflow scroll bounce
    e.preventDefault();
});

$(document).ready(function() {
    /* ----------------------------------------
    Preload Auto-Populate Functions
    ---------------------------------------- */
    function autoPopulatePreload() {
        body.append('<div id="preload"></div>');
        
        var preload = $('#preload');
        
        $('img').each(function() {
            var imageUrl = $(this).attr('src');
            
            preload.append('<img src="' + imageUrl + '" alt="">');
        });
        
        $('[data-background-image]').each(function() {
            var imageUrl = $(this).data('background-image');
            
            preload.append('<img src="' + imageUrl + '" alt="">');
        });
        
        $('[style*="background-image"]').each(function() {
            var imageUrl = $(this).attr('style').replace('background-image: url(', '').replace(')', '').replace(';', '');
            
            preload.append('<img src="' + imageUrl + '" alt="">');
        });
        
        // Don't preload audio for tablet portrait and smaller
        if (!isMobile) {
            $('[data-music]').each(function() {
                var self = $(this)
                preload.append('<audio id="music-for-' + self.index('section') + '" loop preload="true"><source src="' + self.data('music') + '" type="audio/mpeg"></audio>');
            });
            $('[data-sound]').each(function() {
                var self = $(this)
                preload.append('<audio id="sound-for-' + self.index('section') + '" preload="true"><source src="' + self.data('sound') + '" type="audio/mpeg"></audio>');
            });
        }
    }
    
    $.when(autoPopulatePreload()).done(beginLoading);
    
    /* ----------------------------------------
    Audio Functions
    ---------------------------------------- */
    var audioIcon = $('#audio-icon'),
        audio = $('audio'),
        music = $('audio[id*="music-for"]'),
        sound = $('audio[id*="sound-for"]'),
        masterVolume = 1;
    
    function adjustVolume(audioElement, volume, callback) {
        audioElement.stop()
            .animate({
                volume: volume
            }, 1000, 'linear', callback);
    }
    
    function swapMusic(newMusic) {
        music.each(function() {
            var self = $(this);
            adjustVolume(self, 0, function() {
                self[0].pause();
            });
        });
        
        newMusic[0].play();
        adjustVolume(newMusic, masterVolume);
    }
    
    function playChapterMusic(currentSection) {
        if (currentSection.hasClass('end')) { // For scrolling up to the end of a previous section
            var closestIntroIndex = currentSection.prevAll('.has-intro').first().index('section'),
                closestIntroMusic = $('#music-for-' + closestIntroIndex);
            
            swapMusic(closestIntroMusic);
        } else if (currentSection.hasClass('has-intro')) {
            var introIndex = currentSection.index('section'),
                introMusic = $('#music-for-' + introIndex);
            
            swapMusic(introMusic);
        } else if (currentSection.is('#home')) {
            swapMusic($('#music-for-0'));
        }
    }
    
    function playSound(currentSection) {
        var sectionIndex = currentSection.index('section'),
            sectionSound = $('#sound-for-' + sectionIndex),
            otherSound = sound.not(sectionSound);
        
        adjustVolume(sound, 0, function() {
            otherSound[0].pause();
            otherSound[0].currentTime = 0;
        });
        
        if (sectionSound.length > 0) {
            sectionSound[0].play();
            adjustVolume(sectionSound, masterVolume);
        }
    }
    
    if (isMobile) {
        audioIcon.unbind();
    } else {
        audioIcon.click(function() {
            if ($(this).hasClass('fa-volume-up')) {
                $(this).removeClass('fa-volume-up')
                    .addClass('fa-volume-off')
                    .addClass('adjust-p-r-6');
                
                masterVolume = 0;
            } else {
                $(this).removeClass('fa-volume-off')
                    .addClass('fa-volume-up')
                    .removeClass('adjust-p-r-6');
                
                masterVolume = 1;
            }
            
            audio.each(function() {
                $(this).stop(false, true);
                $(this)[0].volume = masterVolume;
            });
        })
            .parent()
            .addClass('show');
    }
    
    /* ----------------------------------------
    Full Parent Height Functions
    ---------------------------------------- */
    var fullParentHeight = $('.full-parent-height');
    
    function calculateFullParentHeight() {
        var windowHeight = window.innerHeight;
        
        fullParentHeight.css('height', windowHeight + 'px');
    }
    
    calculateFullParentHeight();
    $(window).resize(calculateFullParentHeight);
    
    /* ----------------------------------------
    Video Background Functions
    ---------------------------------------- */    
    var videoBackground = $('.video-background'),
        scrollPos,
        adjustedPos,
        videoOffset;
    
    if (!isMobile) { // Don't load videos for mobile
        videoBackground.each(function() {
            var self = $(this),
                source = self.data('src'),
                formats = (typeof(self.data('formats')) != 'undefined') ? self.data('formats').replace(' ', '').split(',') : '';
            
            if (source && formats.length > 0) {
                for (var i = 0; i < formats.length; i++) {
                    self.append('<source src="' + source + '.' + formats[i] + '">');
                }
            }
        });
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
            $(this)[0].play();
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
        var image =  $('#preload img'),
            audioVideo = $('#preload audio, .video-background[data-src][data-formats]'),
            total = (isMobile) ? image.length : image.length + audioVideo.length,
            loadingBar = $('#loading-bar'),
            loaded = 0,
            loadingPercentage = $('#loading-percentage .number');
        
        function processLoadedMedia() {
            if (!body.hasClass('loaded')) {
                loaded ++;
                var percentage = parseInt((loaded / total) * 100);
                
                loadingBar.css('width', percentage + '%');
                loadingPercentage.text(percentage);
                
                if (loaded === total) {
                    body.trigger('load.np')
                }
            }
        }
        
        image.each(function() {
            $(this).load(processLoadedMedia);
        });
        
        audioVideo.each(function() {
            var element = $(this)[0];
            
            if (element.readyState > 3) {
                processLoadedMedia();
            } else {
                element.oncanplay = processLoadedMedia;
            }
        });
        
        page.one('load.np', function() {
            var homeVideo = $('#home-video'),
                homeMusic = $('#music-for-0'),
                scrollMessage = $('.scroll-message');
            
            setTimeout(function() {
                body.addClass('loaded');
                homeVideo.addClass('show');
                if (!isMobile) homeMusic[0].play();
            }, 250);
            
            setTimeout(function() {
                body.trigger('start.np'); // Custom namespaced event to initialize one page scroll
            }, (isDev) ? 0 : 1000);
            
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
        blurElements = $('#underlay, #clouds, #fireworks, .video-background'),
        main = $('.main');
    
    function calculateNavEntryHeight() {        
        var windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            navHeight = (matchMedia('only screen and (max-width: 480px)').matches) ? windowHeight - (windowWidth / linkCount) - 5 : windowHeight,
            linkHeight = (navHeight / linkCount);
        
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
    $(window).resize($.debounce(750, calculateNavEntryHeight));
    openNavButton.click(openNav);
    closeNavButton.click(closeNav);
    
    /* ----------------------------------------
    Sub-Nav Functions
    ---------------------------------------- */
    var subNavEntry = $('#sub-nav > ul > li'),
        subNavLink = $('a', subNavEntry),
        positionIndicator = $('#position-indicator'),
        section = $('section:not(#home)'),
        chapterSectionArray = [],
        sectionCount = 1;
    
    for (var i = 0; i < section.length; i++) {
        var currentSection = section.eq(i);
        
        if (currentSection.hasClass('end')) {            
            chapterSectionArray.push(sectionCount);
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
    
    function setSubNavPosition(currentSection) {
        var isIntro = $(currentSection).hasClass('has-intro'),
            introSection = $('section[id*="chapter"]'),
            homeSection = $('#home'),
            currentSectionIndex,
            currentSubNavChapter,
            size;
        
            subNavEntry.removeClass('active');
        
        if (isIntro) {
            currentSectionIndex = findIndex(currentSection, introSection);
            currentSubNavChapter = $('[href="#' + introSection.eq(currentSectionIndex).attr('id') + '"]', subNavEntry).parent();
            size = (currentSectionIndex / introSection.length) * 100 + '%';
        } else if (!currentSection.is(homeSection)) {
            currentSectionIndex = findIndex(currentSection, section);
            
            var closestIntro = section.eq(currentSectionIndex).prevAll('.has-intro').first(),
                closestIntroId = closestIntro.attr('id'),
                introSectionIndex = findIndex(closestIntro, section),
                chapterIntroSectionIndex = findIndex(closestIntro, introSection),
                introSectionSize = (chapterIntroSectionIndex / introSection.length) * 100,
                currentSectionIndex = findIndex(currentSection, section),
                chapterSectionSize = (((currentSectionIndex - introSectionIndex) / chapterSectionArray[chapterIntroSectionIndex]) / introSection.length) * 100;
            
            currentSubNavChapter = $('[href="#' + section.eq(introSectionIndex).attr('id') + '"]', subNavEntry).parent();
            size = introSectionSize + chapterSectionSize + '%';
        } else { // If home
            size = 0;
        }
        
        positionIndicator.css({
            'width': '',
            'height': ''
        });
        
        if (matchMedia('only screen and (max-width: 480px)').matches) {
            positionIndicator.css('width', size);
        } else {
            positionIndicator.css('height', size);
        }
        
        if (currentSubNavChapter) currentSubNavChapter.addClass('active');
    }
    
    subNavLink.click(function(e) {
        e.preventDefault();
        
        var href = $(this).attr('href'),
            index = $(href).index() + 1;
        
        main.moveTo(index);
    });
    
    $(window).resize($.debounce(750, function() {
        setSubNavPosition($('section.active'))
    }));
    
    
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
    var sectionElements = $('#main section *');
    
    sectionElements.on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend webkitTransitionStart otransitionstart oTransitionStart msTransitionStart transitionstart', function(e) { e.stopPropagation(); }); // Avoid triggering the beforeMove afterMove callback multiple times
    
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
        fireworksList = $('#fireworks'),
        cloudsParallax,
        fireworksParallax;
    
    function enableParallax(list, targetId) {
        switch(targetId) {
            case 'clouds':
                if (typeof(cloudsParallax) == 'undefined') {
                    cloudsParallax = list.parallax();
                } else {
                    cloudsParallax.parallax('enable');
                }
                break;
            case 'fireworks':
                if (typeof(fireworksParallax) == 'undefined') {
                    fireworksParallax = list.parallax();
                } else {
                    fireworksParallax.parallax('enable');
                }
                break;
        }
    }
    
    function disableParallax(targetId) {
        switch(targetId) {
            case 'clouds':
                if (typeof(cloudsParallax) != 'undefined') {
                    cloudsParallax.parallax('disable');
                }
                break;
            case 'fireworks':
                if (typeof(fireworksParallax) != 'undefined') {
                    fireworksParallax.parallax('disable');
                }
                break;
        }
    }
    
    /* ----------------------------------------
    Home Fireworks Functions
    ---------------------------------------- */
    function showFireworks() {
        var fireworksListEntry = $('> li', fireworksList);
        
        fireworksList.addClass('show');
        
        fireworksListEntry.each(function() {
            var fireworksImage = $('img', this),
                listEntryIndex = $(this).index();
            
            setTimeout(function() {
                fireworksImage.addClass('show');
            }, (listEntryIndex * 100));
        });
    }
    
    /* ----------------------------------------
    One Page Scroll Functions
    ---------------------------------------- */
    var underlay = $('#underlay'),
        overlay = $('#overlay'),
        subNav = $('#sub-nav'),
        backgroundImage = $('#background-image'),
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
            subNav.removeClass('show');
            fireworksList.addClass('show');
            
            if (!isMobile) enableParallax(fireworksList, 'fireworks');
        } else {
            homeVideo.removeClass('show');
            subNav.addClass('show');
            horizontalLogo.addClass('show');
            fireworksList.removeClass('show');
            
            if (!isMobile) disableParallax('fireworks');
        }
        
        // If has overlay
        if (activeSection.hasClass('has-overlay')) {
            overlay.addClass('show');
            cloudsList.addClass('show');
            
            if (!isMobile) enableParallax(cloudsList, 'clouds');
        } else {
            overlay.removeClass('show');
            cloudsList.removeClass('show');
            
            if (!isMobile) disableParallax('clouds');
        }
        
        // If has underlay
        if (activeSection.hasClass('has-underlay')) {
            var underlayUrl = activeSection.data('underlay-background');
            
            underlay.css('background-image', 'url(' + underlayUrl + ')')
                .addClass('show');
        } else {
            underlay.removeClass('show');
        }
        
        // If has background image
        if (activeSection.hasClass('has-background-underlay')) {
            var backgroundImageUrl = activeSection.data('background-image');
            
            backgroundImage.css('background-image', 'url(' + backgroundImageUrl + ')')
                .addClass('show');
        } else {
            backgroundImage.removeClass('show');
        }
        
        // If is not home, does not have overlay, and does not have underlay
        if (!activeSection.is('#home') && !activeSection.hasClass('has-overlay') && !activeSection.hasClass('has-underlay')) {
            backgroundVideo.addClass('show');
        } else {
            backgroundVideo.removeClass('show');
        }
        
        setSubNavPosition(activeSection);
        
        if (!isMobile) {
            playChapterMusic(activeSection);
            playSound(activeSection);
        }
    }
    
    function processAfterMove() {
        processAnimateIn(activeSection);
    }
    
    body.one('start.np', function() {
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
        
        if (!isMobile) enableParallax(fireworksList, 'fireworks');
        showFireworks();
    });
    
    /* ----------------------------------------
    Timeline Functions
    ---------------------------------------- */
    var timelineEntryStart = $('.timeline-entry.start'),
        timelineEntryEnd = $('.timeline-entry.end'),
        timelineMarkOffset = 30;
    
    function calculateTimelineBorders() {
        setTimeout(function() { // Ensure all CSS transitions from resize have completed
            var timelineContentPaddingTop;
            
            if (matchMedia('only screen and (max-width: 480px)').matches) {
                var windowWidth = $(window).width();
                
                timelineContentPaddingTop = (windowWidth / linkCount) - 20;
            } else timelineContentPaddingTop = 20;
            
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
        }, 1000);
    }
    $(window).load(calculateTimelineBorders);
    $(window).resize($.debounce(1000, calculateTimelineBorders));
    
    /* ----------------------------------------
    Gallery Type A Functions
    ---------------------------------------- */
    var galleryTypeA = $('.gallery.type-a'),
        galleryPaddingTotal = (matchMedia('only screen and (max-width: 1024px)').matches) ? 240 : 80,
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

            galleryPaddingTotal = (matchMedia('only screen and (max-width: 1024px)').matches) ? 240 : 80;
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
            galleryClosedWidth = (matchMedia('only screen and (max-width: 1024px)').matches) ? 60 : 120,
            totalMarginWidth = 10,
            containerWidth = $(self).closest('.container').width(),
            galleryPaddingTotal = (matchMedia('only screen and (max-width: 1024px)').matches) ? 240 : 80,
            galleryOpenWidth = containerWidth - ((galleryEntryCount - 1) * (galleryClosedWidth + totalMarginWidth)) - totalMarginWidth - galleryPaddingTotal;

        galleryEntry.click(function() {
            galleryEntry.removeClass('active')
                .css('width', '');

            $(this).addClass('active')
                .css('width', galleryOpenWidth + 'px');
        });

        function recalculateWidths() {
            galleryClosedWidth = (matchMedia('only screen and (max-width: 1024px)').matches) ? 60 : 120;
            containerWidth = $(self).closest('.container').width();
            galleryPaddingTotal = (matchMedia('only screen and (max-width: 1024px)').matches) ? 240 : 80;
            galleryOpenWidth = containerWidth - ((galleryEntryCount - 1) * (galleryClosedWidth + totalMarginWidth)) - totalMarginWidth - galleryPaddingTotal;

            $('> li.active', self).css('width', galleryOpenWidth + 'px');
        }

        $(window).resize($.debounce(500, recalculateWidths));

        galleryEntry.first()
            .click(); // Set initial state
    });
    
    /* ----------------------------------------
    Gallery Drag Functions
    ---------------------------------------- */
    var gallery = $('.gallery');
    
    if (isMobile) {
        var touchXPos = 0,
            touchDown = false;
        
        gallery.on('touchstart', function(e) {
            touchXPos = e.originalEvent.touches[0].screenX;
            touchDown = true;
        });
        
        gallery.on('touchmove', function(e) {
            if (touchDown === true) {
                $(this).scrollLeft(parseInt($(this).scrollLeft() + (touchXPos - e.originalEvent.touches[0].screenX)));
                touchXPos = e.originalEvent.touches[0].screenX;
            }
        });
        
        gallery.on('touchend touchcancel', function() {
            touchDown = false;
        });
    } else {
        var cursorXPos = 0,
            cursorDown = false;
        
        gallery.on('mousedown', function(e) {
            cursorXPos = e.offsetX;
            cursorDown = true;
        });
        
        gallery.on('mousemove', function(e) {
            if (cursorDown === true) {
                $(this).scrollLeft(parseInt($(this).scrollLeft() + (cursorXPos - e.offsetX)));
            }
        });
        
        gallery.on('mouseup mouseout', function() {
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
    
    if (!isMobile) quoteImageContainer.hover(hideQuoteBody, showQuoteBody);
    
    $(window).resize($.debounce(500, centerQuoteImages));
    $(window).load(centerQuoteImages);
});