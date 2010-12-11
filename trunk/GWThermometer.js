(function($) {
	/**
	 * Definition of the Thermometer object
	 * @param {element} element
	 * @param {object} config
	 */
	var Thermometer = function(element, config) {
		element = $(element);
		var cfg = {};

		/**
		 * Initialize the thermometer object
		 * @param {string} id The HTML id of the element
		 */
		this.init = function(id) {
			this.val = 0;
			this.pct = 0;
			this.setupUI();
		};
		
		/**
		 * Prime all the values for the display
		 */
		this.setupUI = function() {
			this.el  = element.append('<div class="aws-therm-container"></div>');
			this.container = this.el.find("div.aws-therm-container").append('<div class="aws-therm-fill"></div>');
			this.bar = this.container.find("div.aws-therm-fill");
			
			this.container.css({
				border : cfg.line_width + 'px ' + cfg.line_type + ' ' + cfg.line_color,
				backgroundColor : cfg.background,
				height : ($.browser.msie) ? cfg.height + 2 : cfg.height,
				position : 'relative'
			}).width(cfg.width);
			
			this.bar.css({
				backgroundColor : cfg.fill_color,
				position : 'absolute',
				top : 0,
				left : 0
			}).height(cfg.height).width(0);
			
			if (cfg.show_value) {
				this.value_holder = $('<p class="aws-therm-value"></p>').appendTo(this.container).css({
					position : 'absolute',
					margin : 0,
					padding : 3,
					top : 0,
					fontWeight : 'bold',
					color : cfg.show_value_color
				});
			}
			
			if (cfg.fill_image) {
				this.bar.css({
					background : "url('" + cfg.fill_image + "') repeat-x top left"
				});
			}

			if (cfg.show_hatches) {
				this.el.append('<div class="aws-therm-hatches"></div>');
				this.hatch_container = this.el.find("div.aws-therm-hatches").css({
					height : cfg.hatch_length,
					position : 'relative'
				});
				
				this.hatches = [];
				var hatch_count = Math.floor(100 / cfg.hatch_value);
				var hatch_width = Math.round(cfg.width * (cfg.hatch_value / 100));
				for (var i = 0; i < hatch_count; i++) {
					var hatch = $('<div class="aws-therm-hatch"></div>').appendTo(this.hatch_container).css({
						width : hatch_width,
						height : cfg.hatch_length,
						position : 'absolute',
						left : (i * hatch_width),
						borderLeft : cfg.line_width + 'px ' + cfg.line_type + ' ' + cfg.line_color
					});
					
					if (cfg.show_hatch_labels) {
						var h_val = (cfg.hatch_type == 'qty') ?
							((i * cfg.hatch_value) / 100 * cfg.hatch_total_value) :
							(i * cfg.hatch_value) + '%';
						$('<p>' + h_val + '</p>').appendTo(hatch).css({
							margin: 0,
							padding: '0 0 0 2px',
							fontSize: cfg.hatch_label_size,
							fontFamily: cfg.hatch_label_font
						});
					}
					
					if (i == hatch_count - 1) {
						// put a right border on the last one
						hatch.css('borderRight', cfg.line_width + 'px ' + cfg.line_type + ' ' + cfg.line_color);
						
						if ($.browser.msie) {
							hatch.width(hatch.width() + 2);
						}
					}
					
					this.hatches.push(hatch);
				}
			}
			
		};
		
		/**
		 * Animate fill to the quantity provided
		 * @param {int} num The number of units to calculate
		 */
		this.fillByQuantity = function(num) {
			// Check for bounds in our calculation
			if (num < 0) {
				num = 0;
			} else if (num > cfg.hatch_total_value) {
				num = cfg.hatch_total_value;
			}
		
			// Calculate the actual new width based on quantity
			this.setQuantity(num);
			var new_width = cfg.width * (num / cfg.hatch_total_value);
			this.fill(new_width);
		};
		
		/**
		 * Animate fill to the percentage provided
		 * @param {int} pct The percentage of the thermometer to fill
		 */
		this.fillByPercent = function(pct) {
			// Check for bounds in our calculation
			if (pct > 100) {
				pct = 100;
			} else if (pct < 0) {
				pct = 0;
			}
			
			// Calculate the actual new width based on percentage
			this.setPercent(pct);
			var new_width = cfg.width * (pct / 100);
			this.fill(new_width);
		};
		
		/**
		 * Do the actual animation for filling to the specified size, accounting for browser width discrepencies
		 * @param {int} amt Pixel width to which to move
		 */
		this.fill = function(amt) {
			this.bar.animate({
				width : ($.browser.msie && amt > (cfg.width - 2)) ? amt - 2 : amt
			});
		};
		
		/**
		 * Using the provided <code>num</code>, set the values for quantity and percentage
		 * @param {int} num
		 */
		this.setQuantity = function(num) {
			this.val = num;
			if (cfg.show_value) {
				if (cfg.show_value_type == 'qty') {
					this.showValue(num);
				} else {
					var pct = Math.round((num / cfg.hatch_total_value) * 100);
					this.showValue(pct + '%');
				}
			}
		};
		
		/**
		 * Using the provided <code>pct</code>, set the values for quantity and percentage
		 * @param {int} pct
		 */
		this.setPercent = function(pct) {
			this.pct = pct;
			if (cfg.show_value) {
				if (cfg.show_value_type == 'pct') {
					this.showValue(pct + '%');
				} else {
					var qty = cfg.hatch_total_value * (pct / 100);
					this.showValue(qty);
				}
			}
		};
		
		/**
		 * Display the provided <code>val</code> on the thermometer bar
		 * @param {string} val
		 */
		this.showValue = function(val) {
			this.value_holder.text(val);
		};
		
		/**
		 * Set all default display values, taking into account the provided <code>config</code> overrides
		 * @param {object} config
		 */
		this.setupConfig = function(config) {
			cfg = {
				line_color : (config.line_color || '#000'),
				line_width : (config.line_width || 1),
				line_type  : (config.line_type || 'solid'),
				background : (config.background || '#fff'),
				fill_color : (config.fill_color || '#44A0FC'),
				fill_image : (config.fill_image || null),
				show_hatches : (config.show_hatches || false),
				hatch_length : (config.hatch_length || 10),
				hatch_value  : (config.hatch_value || 10),
				hatch_type   : (config.hatch_type || 'pct'),
				hatch_total_value : (config.hatch_total_value || 100),
				show_hatch_labels : (config.show_hatch_labels || false),
				hatch_label_font : (config.hatch_label_font || 'Arial, Verdana, Helvetica, sans-serif'),
				hatch_label_size : (config.hatch_label_size || 9),
				show_value : (config.show_value || false),
				show_value_type : (config.show_value_type || 'pct'),
				show_value_color : (config.show_value_color || '#000'),
				width  : (config.width || 100),
				height : (config.height || 20)
			};
		};

		// Initialize the object
		this.setupConfig(config);
		this.init(element);
	};
	
	// Declare the actual plugin
	$.fn.GWThermometer = function(options) {
		return this.each(function() {
			var element = $(this);
			
			// Return early if this element already has a plugin instance
			if (element.data('GWThermometer')) return;
			
			// Store plugin object in this element's data
			var th = new Thermometer(this, options);
			element.data('GWThermometer', th);
		});
	};
})(jQuery);
