"use strict";

/* file_urls.get(String kind, Blob blob)
 *   kind identifies semantics of the blob. URL will be revoked when
 *     URL of the same kind will be requested.
 */
const file_urls = function() { /* namespace {{{ */
    const urls = {};

    function get(kind, blob) {
        if (urls[kind] != null) {
            revoke(kind);
        }
        return urls[kind] = URL.createObjectURL(blob);
    }

    function revoke(kind) {
        if (urls[kind] != null) {
            URL.revokeObjectURL(urls[kind]);
        }
    }

    return { get: get, revoke: revoke };
}(); /* }}} */

/* separators.enable(JQuery $elements)
 */
const separators = function() { /* namespace {{{ */
    var active = null;
    const $overlay = $("#splitter__overlay");

    function enable($elements) {
        return $elements.mousedown(activate)[0];
    }

    function activate() {
        window.getSelection().removeAllRanges();
        if (active != null)
            $(active).removeClass("active");
        active = this;
        $(active).addClass("active");
        $overlay.css("z-index", +1);
        console.log("hop");
    }

    function deactivate() {
        if (active == null)
            return;
        $(active).removeClass("active");
        $("#splitter__overlay").css("z-index", -1);
        active = null;
        console.log("op");
    }

    function move_it(event) {
        if (active == null)
            return;
        window.getSelection().removeAllRanges();
        var $separator = $(active);
        var $container = $separator.parent();
        var is_vertical = $container.hasClass("splitter--vertical");
        var offset = $container.offset();
        var flex = {prev: {basis: 0, grow: 0}, next: {basis: 0, grow: 0}};
        var $prev = $separator.prevAll();
        var $next = $separator.nextAll();
        function add_flex_stat(flex_stat_item) {
            let $this = $(this);
            let flex_basis = $this.css("flex-basis");
            let flex_grow = $this.css("flex-grow")
            if (flex_basis == "auto") {
                if (flex_grow != "0")
                    throw "we have a problem";
                flex_basis = is_vertical ? $this.width() : $this.height();
            }
            flex_stat_item.basis += parseFloat(flex_basis);
            flex_stat_item.grow += parseFloat(flex_grow);
        };
        $prev.each(function() { add_flex_stat.call(this, flex.prev); });
        $next.each(function() { add_flex_stat.call(this, flex.next); });
        {
            let offset = $container.offset();
            var position = is_vertical ?
                (event.pageX - offset.left) : (event.pageY - offset.top);
        }
        var total = is_vertical ? $container.width() : $container.height();
        var excess = total - flex.prev.basis - flex.next.basis;
        if (excess <= 0)
            return;
        var separator_size =
            is_vertical ? $separator.width() : $separator.height();
        flex.prev.excess = ( position - flex.prev.basis
            - separator_size / 2 );
        if (flex.prev.excess <= 0) {
            flex.prev.excess = 0;
        }
        flex.next.excess = excess - flex.prev.excess - separator_size;
        if (flex.next.excess <= 0) {
            flex.next.excess = 0;
            flex.prev.excess = excess;
        }
        var $prev$parts = $prev.filter('.splitter__part');
        var $next$parts = $next.filter('.splitter__part');
        flex.prev.count = $prev$parts.length;
        flex.next.count = $next$parts.length;
        $prev$parts.each(function() {
            var $this = $(this);
            if (flex.prev.grow <= 0) {
                $this.css("flex-grow", flex.prev.excess / flex.prev.count);
            } else {
                $this.css( "flex-grow", $this.css("flex-grow") *
                    flex.prev.excess / flex.prev.grow );
            }
        });
        $next$parts.each(function() {
            var $this = $(this);
            if (flex.next.grow <= 0) {
                $this.css("flex-grow", flex.next.excess / flex.next.count);
            } else {
                $this.css( "flex-grow", $this.css("flex-grow") *
                    flex.next.excess / flex.next.grow );
            }
        });
    }

    $(window).mouseup(deactivate);
    $overlay.mouseup(deactivate);
    $overlay.mouseleave(deactivate);
    $(window).mousemove(move_it);

    return { enable: enable };
}(); /* }}} */
separators.enable($(".splitter__separator"))

/* sources.get_current()
 * sources.autosave()
 */
const sources = function() { /* namespace {{{ */
    var editor = ace.edit('editor');
    editor.setTheme("ace/theme/vibrant_ink");
    editor.commands.addCommand({
        bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
        name: 'asycompile', exec: function() { output.compile(); },
    });
    editor.focus();
    var projects_db = null;
    open_projects_db(autoload);

    /*
     *  IndexedDB 'projects'
     *    object store 'projects'
     *      <name> : {
     *        info: {
     *          name: <name>,
     *          files: ["main.asy"],
     *          main: "main.asy",
     *          editor_options: {
     *            "main.asy" : {
     *              flex_grow: 1.0,
     *              position: {row: <number>, column: <number>},
     *            },
     *        },
     *        files: { "main.asy": <content> }
     *      }
     *
     * localStorage
     *   current: <name>
     */

    function get_current() {
        return {
            info: { files: ['main.asy'], main: 'main.asy' },
            files: { 'main.asy' : editor.getValue() }
        };
    }

    function open_projects_db(success_callback) {
        if (!window.indexedDB) {
            open_projects_db_fail();
            return;
        }
        let request = indexedDB.open("projects", 1);
        request.onupgradeneeded = function(event) {
            let projects_db = event.target.result;
            let projects_store = projects_db.createObjectStore(
                "projects", { keyPath: "info.name" } );
        }
        request.onsuccess = function(event) {
            projects_db = event.target.result;
            autoload();
        }
        request.onerror = function(event) {
            open_projects_db_fail();
            autoload_default();
        }
    }
    function open_projects_db_fail() {
        console.log("Saving and loading is disabled. " +
            "(IndexedDB capability unavailable.)" );
    }

    function autosave() {
        if (!projects_db)
            return console.log("Autosave is disabled.");
        let transaction = projects_db.transaction(
            ['projects'], 'readwrite' );
        let projects_store = transaction.objectStore('projects');
        let editor_position = editor.selection.getCursor();
        projects_store.put({
            info: {
                name: "default",
                files: ["main.asy"],
                main: "main.asy",
                editor_options: {
                    "main.asy": {
                        flex_grow: 1.0,
                        position: {
                            row: editor_position.row,
                            column: editor_position.column,
                        },
                    },
                },
            },
            files: {
                "main.asy": editor.getValue(),
            },
        });
        transaction.onerror = function(event) {
            console.log("Autosave failed:", event.target.error);
        };
    }

    function autoload() {
        if (!projects_db)
            return console.log("Autoload is disabled.");
        let transaction = projects_db.transaction(
            ['projects'], 'readonly' );
        let projects_store = transaction.objectStore('projects');
        let request = projects_store.get("default");
        request.onsuccess = function(event) {
            let project = event.target.result;
            if (!project)
                return autoload_default();
            editor.setValue(project.files["main.asy"]);
            editor.selection.clearSelection();
            let position = project.info.editor_options["main.asy"].position;
            if (position) {
                editor.selection.moveCursorToPosition(position);
            } else {
                editor.selection.moveCursorFileEnd();
            }
        };
    }
    function autoload_default() {
        editor.setValue("size(7cm);\n\n");
        editor.selection.clearSelection();
        editor.selection.moveCursorFileEnd();
    }

    return { get_current: get_current, autosave: autosave };
}(); /* }}} */

/* output.compile();
 */
const output = function() { /* namespace {{{ */
    var $output = $("#output");
    var current_request = null;
    var flex_grow = {text: 1.0, svg: (Math.sqrt(5)+1)/2};
    var svg_size = {height: null, width: null};

    function empty() {
      let $text = $output.children('.output__part--text');
      let $svg = $output.children('.output__part--svg');
      if ($text.length == 1 && $svg.length == 1) {
        flex_grow.text = $text.css('flex-grow');
        flex_grow.svg = $svg.css('flex-grow');
      }
      $output.empty();
    }

    function append_error(text) {
        let $error_data = $('<span/>')
            .addClass('output__data output__data--error')
            .text(text);
        let $error_part = $('<div/>')
            .addClass('output__part output__part--error')
            .append($error_data);
        $output.append($error_part);
    }

    function append_help() {
        $output.append(
          $('<div/>')
            .addClass('output__part output__part--error')
            .text("Press Ctrl-Enter to compile image with Asymptote.")
        );
    }

    function compile() {
        sources.autosave();
        if (current_request != null) {
            return abort_request();
        }
        let request = new XMLHttpRequest();
        current_request = request;
        let formdata = new FormData();
        let project = sources.get_current();
        let info = {
            files: project.info.files, main: project.info.main,
            outformat: "svg" };
        formdata.append("info", JSON.stringify(info));
        for (let i = 0; i < info.files.length; ++i) {
            let filename = info.files[i]
            formdata.append(filename, project.files[filename]);
        }
        request.addEventListener('load', compile_finish);
        request.addEventListener('error', request_fail);
        request.open("POST", "/compile", /* async = */ true);
        request.send(formdata);
    }

    function compile_finish() {
      if (this !== current_request) {
        return;
      }
      current_request = null;
      empty();
      file_urls.revoke('svg');
      let response_type = this.getResponseHeader("Content-Type");
      if (!response_type.startsWith("application/json")) {
        $output.html(this.responseText);
        return;
      }
      let response = JSON.parse(this.responseText);
      if (response.error) {
        append_error(response.error);
      }
      if (response.output) {
        let $text_data = $('<code/>')
          .addClass('output__data output__data--text')
          .text(response.output);
        let $text_part = $('<div/>')
          .addClass('output__part output__part--text splitter__part')
          .css('flex-grow', flex_grow.text)
          .append($text_data);
        $output.append($text_part);
      }
      if (response.output && response.svg) {
        let $separator = $('<div/>').addClass('splitter__separator');
        $output.append($separator);
        separators.enable($separator);
      }
      if (response.svg) {
        let $svg_data = $(response.svg);
        let $svg = $svg_data.filter('svg');
        svg_size.width = parseFloat($svg.attr('width'));
        svg_size.height = parseFloat($svg.attr('height'));
        $svg.removeAttr('width');
        $svg.removeAttr('height');
        $svg.css({width: "100%", height: "100%"});
        let $svg_part = $('<div>')
          .addClass('output__part output__part--svg splitter__part')
          .css('flex-grow', flex_grow.svg)
          .append($svg);
        $output.append($svg_part);
        $output.append(get_save_part(response.svg));
      }
    }

    function get_save_part(svg_data) {
      let $save_button = $('<a/>')
        .addClass('output__data button')
        .text("Save image");
      let $save_part = $('<div/>')
        .addClass('output__part output__part--save')
        .append($save_button);
      $save_button.click(function() {
        let $save_link = $('<a/>')
          .addClass('output__data')
          .attr('href',
            create_file_url('svg', svg_data, 'image/svg+xml') )
          .attr('download', 'image.svg')
          .text("Save image to file (SVG)");
        $save_part.html($save_link);
      });
      return $save_part;
    }

    function abort_request() {
        current_request.abort();
        empty();
        append_error( "You cancelled the request. " +
            "Awaiting server status update…" );
        let request = new XMLHttpRequest();
        current_request = request;
        request.addEventListener('load', check_status_finish);
        request.addEventListener('error', request_fail);
        request.open("GET", "/status", /* async = */ true);
        request.send();
    }

    function check_status_finish() {
      if (this !== current_request) {
        return;
      }
      current_request = null;
      empty();
      $output.append(
        $('<div/>')
          .addClass('output__part output__part--error')
          .text( "Server is reachable. " )
      )
      append_help($output);
    }

    function request_fail() {
        if (this !== current_request) {
            return;
        }
        current_request = null;
        empty();
        append_error("Server is unreachable. Try again.");
    }

    append_help();
    return { compile: compile };
}(); /* }}} */

// vim: set filetype=javascript foldmethod=marker :
