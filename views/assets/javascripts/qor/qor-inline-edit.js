(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node / CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals.
        factory(jQuery);
    }
})(function($) {

    'use strict';

    const NAMESPACE = 'qor.inlineEdit',
        EVENT_ENABLE = 'enable.' + NAMESPACE,
        EVENT_DISABLE = 'disable.' + NAMESPACE,
        EVENT_CLICK = 'click.' + NAMESPACE,
        EVENT_MOUSEENTER = 'mouseenter.' + NAMESPACE,
        EVENT_MOUSELEAVE = 'mouseleave.' + NAMESPACE,
        CLASS_FIELD = '.qor-field',
        CLASS_FIELD_SHOW = '.qor-field__show',
        CLASS_EDIT = '.qor-inlineedit__edit',
        CLASS_SAVE = '.qor-inlineedit__save',
        CLASS_BUTTONS = '.qor-inlineedit__buttons',
        CLASS_CANCEL = '.qor-inlineedit__cancel',
        CLASS_CONTAINER = 'qor-inlineedit__field';

    function QorInlineEdit(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, QorInlineEdit.DEFAULTS, $.isPlainObject(options) && options);
        this.init();
    }

    function getJsonData(names, data) {
        let key = '',
            value = data[names[0].slice(1)];

        if (names.length > 1) {
            for (let i = 1; i < names.length; i++) {
                key = names[i].slice(1);
                value = value[key];
            }
        }

        return value;
    }

    QorInlineEdit.prototype = {
        constructor: QorInlineEdit,

        init: function() {
            this.bind();
        },

        bind: function() {
            this.$element
                .on(EVENT_MOUSEENTER, CLASS_FIELD_SHOW, this.showEditButton)
                .on(EVENT_MOUSELEAVE, CLASS_FIELD_SHOW, this.hideEditButton)
                .on(EVENT_CLICK, CLASS_CANCEL, this.hideEdit)
                .on(EVENT_CLICK, CLASS_SAVE, this.saveEdit)
                .on(EVENT_CLICK, CLASS_EDIT, this.showEdit);
        },

        unbind: function() {
            this.$element
                .off(EVENT_MOUSEENTER, CLASS_FIELD_SHOW, this.showEditButton)
                .off(EVENT_MOUSELEAVE, CLASS_FIELD_SHOW, this.hideEditButton)
                .off(EVENT_CLICK, CLASS_CANCEL, this.hideEdit)
                .off(EVENT_CLICK, CLASS_SAVE, this.saveEdit)
                .off(EVENT_CLICK, CLASS_EDIT, this.showEdit);
        },

        showEditButton: function() {
            let $edit = $(QorInlineEdit.TEMPLATE_EDIT);
            $edit.appendTo($(this));
        },

        hideEditButton: function() {
            $('.qor-inlineedit__edit').remove();
        },

        showEdit: function() {
            let $parent = $(this).hide().closest(CLASS_FIELD).addClass(CLASS_CONTAINER),
                $save = $(QorInlineEdit.TEMPLATE_SAVE);

            $save.appendTo($parent);
        },

        hideEdit: function() {
            let $parent = $(this).closest(CLASS_FIELD).removeClass(CLASS_CONTAINER);
            $parent.find(CLASS_BUTTONS).remove();
        },

        saveEdit: function() {
            let $btn = $(this),
                $parent = $btn.closest(CLASS_FIELD),
                $form = $btn.closest('form'),
                $input = $parent.find('input[name*="QorResource"],textarea[name*="QorResource"],select[name*="QorResource"]'),
                names = $input.length && $input.prop('name').match(/\.\w+/g),
                inputData = $input.serialize();

            if (names.length)

                $.ajax($form.prop('action'), {
                    method: $form.prop('method'),
                    data: inputData,
                    dataType: 'json',
                    beforeSend: function() {
                        $btn.prop('disabled', true);
                    },
                    success: function(data) {
                        let newValue = getJsonData(names, data);

                        console.log(data);
                        console.log(newValue);

                        $parent.removeClass(CLASS_CONTAINER).find(CLASS_FIELD_SHOW).html(newValue);
                        $parent.find(CLASS_BUTTONS).remove();
                        $btn.prop('disabled', false);
                    },
                    error: function(xhr, textStatus, errorThrown) {
                        window.alert([textStatus, errorThrown].join(': '));
                        $btn.prop('disabled', false);
                    }
                });
        },

        destroy: function() {
            this.unbind();
            this.$element.removeData(NAMESPACE);
        }
    };

    QorInlineEdit.DEFAULTS = {};

    QorInlineEdit.TEMPLATE_EDIT = `<button class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored qor-inlineedit__edit" type="button"><i class="material-icons">mode_edit</i></button>`;
    QorInlineEdit.TEMPLATE_SAVE = `<div class="qor-inlineedit__buttons">
                                    <button class="mdl-button mdl-button--colored mdl-js-button qor-button--small qor-inlineedit__cancel" type="button">cancel edit</button>
                                    <button class="mdl-button mdl-button--colored mdl-js-button qor-button--small qor-inlineedit__save" type="button">save</button>
                                    </div>`;

    QorInlineEdit.plugin = function(options) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data(NAMESPACE);
            var fn;

            if (!data) {
                $this.data(NAMESPACE, (data = new QorInlineEdit(this, options)));
            }

            if (typeof options === 'string' && $.isFunction(fn = data[options])) {
                fn.call(data);
            }
        });
    };

    $(function() {
        let selector = '[data-toggle="qor.inlineEdit"]',
            options = {};

        $(document).
        on(EVENT_DISABLE, function(e) {
            QorInlineEdit.plugin.call($(selector, e.target), 'destroy');
        }).
        on(EVENT_ENABLE, function(e) {
            QorInlineEdit.plugin.call($(selector, e.target), options);
        }).
        triggerHandler(EVENT_ENABLE);
    });

    return QorInlineEdit;

});
