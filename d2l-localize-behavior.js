import '@polymer/polymer/polymer-legacy.js';
import { AppLocalizeBehavior } from '@polymer/app-localize-behavior/app-localize-behavior.js';
import d2lIntl from 'd2l-intl';
window.D2L = window.D2L || {};
window.D2L.PolymerBehaviors = window.D2L.PolymerBehaviors || {};

/** @polymerBehavior D2L.PolymerBehaviors.LocalizeBehaviorImpl */
D2L.PolymerBehaviors.LocalizeBehaviorImpl = {
	properties: {
		formatDateTime: {
			type: Function,
			computed: '_computeFormatDateTime(language, __overrides, __timezone)'
		},
		formatDate: {
			type: Function,
			computed: '_computeFormatDate(language, __overrides, __timezone)'
		},
		formatFileSize: {
			type: Function,
			computed: '_computeFormatFileSize(language)'
		},
		formatNumber: {
			type: Function,
			computed: '_computeFormatNumber(language, __overrides)'
		},
		formatTime: {
			type: Function,
			computed: '_computeFormatTime(language, __overrides, __timezone)'
		},
		language: {
			type: String,
			computed: '_computeLanguage(resources, __documentLanguage, __documentLanguageFallback)'
		},
		parseDate: {
			type: Function,
			computed: '_computeParseDate(language, __overrides)'
		},
		parseNumber: {
			type: Function,
			computed: '_computeParseNumber(language, __overrides)'
		},
		parseTime: {
			type: Function,
			computed: '_computeParseTime(language)'
		},
		__documentLanguage: {
			type: String,
			value: function() {
				return window.document.getElementsByTagName('html')[0]
					.getAttribute('lang');
			}
		},
		__documentLanguageFallback: {
			type: String,
			value: function() {
				return window.document.getElementsByTagName('html')[0]
					.getAttribute('data-lang-default');
			}
		},
		__overrides: {
			type: Object,
			value: function() {
				return this._tryParseHtmlElemAttr('data-intl-overrides', {});
			}
		},
		__timezoneObject: {
			type: Object,
			value: function() {
				return this._tryParseHtmlElemAttr('data-timezone', {name: '', identifier: ''});
			}
		},
		__timezone: {
			type: String,
			computed: '_computeTimezone(__timezoneObject)'
		}
	},
	observers: [
		'_languageChange(language)',
		'_timezoneChange(__timezoneObject)',
	],
	attached: function() {

		var htmlElem = window.document.getElementsByTagName('html')[0];

		this._observer = new MutationObserver(function(mutations) {
			for (var i = 0; i < mutations.length; i++) {
				var mutation = mutations[i];
				if (mutation.attributeName === 'lang') {
					this.__documentLanguage = htmlElem.getAttribute('lang');
				} else if (mutation.attributeName === 'data-lang-default') {
					this.__documentLanguageFallback = htmlElem.getAttribute('data-lang-default');
				} else if (mutation.attributeName === 'data-intl-overrides') {
					this.__overrides = this._tryParseHtmlElemAttr('data-intl-overrides', {});
				} else if (mutation.attributeName === 'data-timezone') {
					this.__timezoneObject = this._tryParseHtmlElemAttr('data-timezone', {name: '', identifier: ''});
				}
			}
		}.bind(this));
		this._observer.observe(htmlElem, { attributes: true });

	},
	detached: function() {
		if (this._observer && this._observer.disconnect) {
			this._observer.disconnect();
		}
	},
	getTimezone: function() {
		return this.__timezoneObject;
	},
	_computeTimezone: function(timezoneObject) {
		return timezoneObject && timezoneObject.name;
	},
	_computeFormatDateTime: function(language, overrides, timezone) {
		return function(val, opts) {
			opts = opts || {};
			opts.locale = overrides;
			opts.timezone = opts.timezone || timezone;
			var formatter = new d2lIntl.DateTimeFormat(language, opts);
			return formatter.format(val);
		};
	},
	_computeFormatDate: function(language, overrides, timezone) {
		return function(val, opts) {
			opts = opts || {};
			opts.locale = overrides;
			opts.timezone = opts.timezone || timezone;
			var formatter = new d2lIntl.DateTimeFormat(language, opts);
			return formatter.formatDate(val);
		};
	},
	_computeFormatFileSize: function(language) {
		return function(val) {
			var formatter = new d2lIntl.FileSizeFormat(language);
			return formatter.format(val);
		};
	},
	_computeFormatNumber: function(language, overrides) {
		return function(val, opts) {
			opts = opts || {};
			opts.locale = overrides;
			var formatter = new d2lIntl.NumberFormat(language, opts);
			return formatter.format(val);
		};
	},
	_computeFormatTime: function(language, overrides, timezone) {
		return function(val, opts) {
			opts = opts || {};
			opts.locale = overrides;
			opts.timezone = opts.timezone || timezone;
			var formatter = new d2lIntl.DateTimeFormat(language, opts);
			return formatter.formatTime(val);
		};
	},
	_computeParseDate: function(language, overrides) {
		return function(val) {
			var parser = new d2lIntl.DateTimeParse(
				language,
				{ locale: overrides }
			);
			return parser.parseDate(val);
		};
	},
	_computeParseNumber: function(language, overrides) {
		return function(val, opts) {
			opts = opts || {};
			opts.locale = overrides;
			var parser = new d2lIntl.NumberParse(language, opts);
			return parser.parse(val);
		};
	},
	_computeParseTime: function(language) {
		return function(val) {
			var parser = new d2lIntl.DateTimeParse(language);
			return parser.parseTime(val);
		};
	},
	_observer: null,
	_computeLanguage: function(resources, lang, fallback) {
		var language = this._tryResolve(resources, lang)
			|| this._tryResolve(resources, fallback)
			|| this._tryResolve(resources, 'en-us');
		return language;
	},
	_languageChange: function() {
		this.fire('d2l-localize-behavior-language-changed');
	},
	_timezoneChange: function() {
		this.fire('d2l-localize-behavior-timezone-changed');
	},
	_tryResolve: function(resources, val) {

		if (val === null) return null;
		val = val.toLowerCase();
		var baseLang = val.split('-')[0];

		var foundBaseLang = null;
		for (var key in resources) {
			var keyLower = key.toLowerCase();
			if (keyLower.toLowerCase() === val) {
				return key;
			} else if (keyLower === baseLang) {
				foundBaseLang = key;
			}
		}

		if (foundBaseLang) {
			return foundBaseLang;
		}

		return null;

	},
	_tryParseHtmlElemAttr: function(attrName, defaultValue) {
		var htmlElems = window.document.getElementsByTagName('html');
		if (htmlElems.length === 1 && htmlElems[0].hasAttribute(attrName)) {
			try {
				return JSON.parse(htmlElems[0].getAttribute(attrName));
			} catch (e) {
				// swallow exception
			}
		}
		return defaultValue;
	}
};

/** @polymerBehavior */
D2L.PolymerBehaviors.LocalizeBehavior = [
	AppLocalizeBehavior,
	D2L.PolymerBehaviors.LocalizeBehaviorImpl
];
