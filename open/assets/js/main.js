(function($) {

	var	$window = $(window),
		$body = $('body');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Touch?
		if (browser.mobile)
			$body.addClass('is-touch');

	// Forms.
		var $form = $('form');

		// Auto-resizing textareas.
			$form.find('textarea').each(function() {

				var $this = $(this),
					$wrapper = $('<div class="textarea-wrapper"></div>'),
					$submits = $this.find('input[type="submit"]');

				$this
					.wrap($wrapper)
					.attr('rows', 1)
					.css('overflow', 'hidden')
					.css('resize', 'none')
					.on('keydown', function(event) {

						if (event.keyCode == 13
						&&	event.ctrlKey) {

							event.preventDefault();
							event.stopPropagation();

							$(this).blur();

						}

					})
					.on('blur focus', function() {
						$this.val($.trim($this.val()));
					})
					.on('input blur focus --init', function() {

						$wrapper
							.css('height', $this.height());

						$this
							.css('height', 'auto')
							.css('height', $this.prop('scrollHeight') + 'px');

					})
					.on('keyup', function(event) {

						if (event.keyCode == 9)
							$this
								.select();

					})
					.triggerHandler('--init');

				// Fix.
					if (browser.name == 'ie'
					||	browser.mobile)
						$this
							.css('max-height', '10em')
							.css('overflow-y', 'auto');

			});

	// Menu.
		var $menu = $('#menu');

		$menu.wrapInner('<div class="inner"></div>');

		$menu._locked = false;

		$menu._lock = function() {

			if ($menu._locked)
				return false;

			$menu._locked = true;

			window.setTimeout(function() {
				$menu._locked = false;
			}, 350);

			return true;

		};

		$menu._show = function() {

			if ($menu._lock())
				$body.addClass('is-menu-visible');

		};

		$menu._hide = function() {

			if ($menu._lock())
				$body.removeClass('is-menu-visible');

		};

		$menu._toggle = function() {

			if ($menu._lock())
				$body.toggleClass('is-menu-visible');

		};

		$menu
			.appendTo($body)
			.on('click', function(event) {
				event.stopPropagation();
			})
			.on('click', 'a', function(event) {

				var href = $(this).attr('href');

				event.preventDefault();
				event.stopPropagation();

				// Hide.
					$menu._hide();

				// Redirect.
					if (href == '#menu')
						return;

					window.setTimeout(function() {
						window.location.href = href;
					}, 350);

			})
			.append('<a class="close" href="#menu">Close</a>');

		$body
			.on('click', 'a[href="#menu"]', function(event) {

				event.stopPropagation();
				event.preventDefault();

				// Toggle.
					$menu._toggle();

			})
			.on('click', function(event) {

				// Hide.
					$menu._hide();

			})
			.on('keydown', function(event) {

				// Hide on escape.
					if (event.keyCode == 27)
						$menu._hide();

			});

    // Gallery.
        $('.gallery')
            .wrapInner('<div class="inner"></div>')
            .prepend(browser.mobile ? '' : '<div class="forward"></div><div class="backward"></div>')
            .scrollex({
                top:		'30vh',
                bottom:		'30vh',
                delay:		50,
                initialize:	function() {
                    $(this).addClass('is-inactive');
                },
                terminate:	function() {
                    $(this).removeClass('is-inactive');
                },
                enter:		function() {
                    $(this).removeClass('is-inactive');
                },
                leave:		function() {

                    var $this = $(this);

                    if ($this.hasClass('onscroll-bidirectional'))
                        $this.addClass('is-inactive');

                }
            })
            .children('.inner')
                //.css('overflow', 'hidden')
                .css('overflow-y', browser.mobile ? 'visible' : 'hidden')
                .css('overflow-x', browser.mobile ? 'scroll' : 'hidden')
                .scrollLeft(0);

        // Style #1.
            // ...

        // Style #2.
            $('.gallery')
                .on('wheel', '.inner', function(event) {

                    var	$this = $(this),
                        delta = (event.originalEvent.deltaX * 10);

                    // Cap delta.
                        if (delta > 0)
                            delta = Math.min(25, delta);
                        else if (delta < 0)
                            delta = Math.max(-25, delta);

                    // Scroll.
                        $this.scrollLeft( $this.scrollLeft() + delta );

                })
                .on('mouseenter', '.forward, .backward', function(event) {

                    var $this = $(this),
                        $inner = $this.siblings('.inner'),
                        direction = ($this.hasClass('forward') ? 1 : -1);

                    // Clear move interval.
                        clearInterval(this._gallery_moveIntervalId);

                    // Start interval.
                        this._gallery_moveIntervalId = setInterval(function() {
                            $inner.scrollLeft( $inner.scrollLeft() + (5 * direction) );
                        }, 10);

                })
                .on('mouseleave', '.forward, .backward', function(event) {

                    // Clear move interval.
                        clearInterval(this._gallery_moveIntervalId);

                });

        // Lightbox.
            $('.gallery.lightbox')
                .on('click', 'a', function(event) {

                    var $a = $(this),
                        $gallery = $a.parents('.gallery'),
                        $modal = $gallery.children('.modal'),
                        $modalImg = $modal.find('img'),
                        href = $a.attr('href');

                    // Not an image? Bail.
                        if (!href.match(/\.(jpg|gif|png|mp4)$/))
                            return;

                    // Prevent default.
                        event.preventDefault();
                        event.stopPropagation();

                    // Locked? Bail.
                        if ($modal[0]._locked)
                            return;

                    // Lock.
                        $modal[0]._locked = true;

                    // Set src.
                        $modalImg.attr('src', href);

                    // Set visible.
                        $modal.addClass('visible');

                    // Focus.
                        $modal.focus();

                    // Delay.
                        setTimeout(function() {

                            // Unlock.
                                $modal[0]._locked = false;

                        }, 600);

                })
                .on('click', '.modal', function(event) {

                    var $modal = $(this),
                        $modalImg = $modal.find('img');

                    // Locked? Bail.
                        if ($modal[0]._locked)
                            return;

                    // Already hidden? Bail.
                        if (!$modal.hasClass('visible'))
                            return;

                    // Lock.
                        $modal[0]._locked = true;

                    // Clear visible, loaded.
                        $modal
                            .removeClass('loaded')

                    // Delay.
                        setTimeout(function() {

                            $modal
                                .removeClass('visible')

                            setTimeout(function() {

                                // Clear src.
                                    $modalImg.attr('src', '');

                                // Unlock.
                                    $modal[0]._locked = false;

                                // Focus.
                                    $body.focus();

                            }, 475);

                        }, 125);

                })
                .on('keypress', '.modal', function(event) {

                    var $modal = $(this);

                    // Escape? Hide modal.
                        if (event.keyCode == 27)
                            $modal.trigger('click');

                })
                .prepend('<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>')
                    .find('img')
                        .on('load', function(event) {

                            var $modalImg = $(this),
                                $modal = $modalImg.parents('.modal');

                            setTimeout(function() {

                                // No longer visible? Bail.
                                    if (!$modal.hasClass('visible'))
                                        return;

                                // Set loaded.
                                    $modal.addClass('loaded');

                            }, 275);

                        });

})(jQuery);