"use strict";

/*
 * file_urls.get(String kind, Blob blob)
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

/*
 * separators.enable(JQuery $separators)
 * separators.resize(JQuery $splitter)
 * separators.get_flex_portion(JQuery $splitter_part)
 * separators.set_flex_portion(JQuery $splitter_part, float portion)
 */
const separators = function() { /* namespace {{{ */
    var active = null;
    const $overlay = $("#splitter__overlay");

    function enable($separators) {
        $separators.mousedown(activate);
        return;
    }

    function activate() {
        window.getSelection().removeAllRanges();
        if (active != null)
            $(active).removeClass("active");
        active = this;
        let $separator = $(active);
        $separator.addClass("active");
        $overlay.css("z-index", +1);
        $overlay.css("cursor", $separator.css("cursor"));
        $separator.trigger("separator:activate");
    }

    function deactivate() {
        if (active == null)
            return;
        let $separator = $(active);
        $separator.removeClass("active");
        $("#splitter__overlay").css("z-index", -1);
        active = null;
        $separator.trigger("separator:deactivate");
    }

    function move_it(event) {
        if (active == null)
            return;
        window.getSelection().removeAllRanges();
        let $separator = $(active);
        let $container = $separator.parent();
        let is_vertical = $container.hasClass("splitter--vertical");
        let $prev = $separator.prevAll();
        let $next = $separator.nextAll();
        let flex = {
          prev: collect_flex_stat($prev, is_vertical),
          next: collect_flex_stat($next, is_vertical) };
        let position; {
            let offset = $container.offset();
            position = is_vertical ?
                (event.pageX - offset.left) : (event.pageY - offset.top);
        }
        let total = is_vertical ? $container.width() : $container.height();
        let total_part_count = flex.prev.part_count + flex.next.part_count;
        let excess = total - flex.prev.basis - flex.next.basis;
        if (excess <= 0) {
            return;
        }
        if (flex.prev.part_count == 0 || flex.next.part_count == 0) {
            return;
        }
        let separator_size =
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
        flex.prev.new_grow = total_part_count *
          (flex.prev.excess / excess);
        flex.next.new_grow = total_part_count *
          (flex.next.excess / excess);
        let $prev$parts = $prev.filter('.splitter__part');
        if (flex.prev.grow <= 0) {
            $prev$parts.each(function() {
                $(this).css( "flex-grow", flex.prev.new_grow *
                    1 / flex.prev.part_count);
            });
        } else {
            $prev$parts.each(function() {
                $(this).css( "flex-grow", flex.prev.new_grow *
                    $(this).css("flex-grow") / flex.prev.grow );
            });
        }
        let $next$parts = $next.filter('.splitter__part');
        if (flex.next.grow <= 0) {
            $next$parts.each(function() {
                $(this).css( "flex-grow", flex.next.new_grow *
                    1 / flex.next.part_count);
            });
        } else {
            $next$parts.each(function() {
                $(this).css( "flex-grow", flex.next.new_grow *
                    $(this).css("flex-grow") / flex.next.grow );
            });
        }
        $separator.trigger("separator:move");
    }
    function collect_flex_stat($elements, is_vertical) {
        let stat = {basis: 0, grow: 0, part_count: 0};
        $elements.each(function() {
            let $this = $(this);
            let flex_basis = $this.css("flex-basis");
            let flex_grow = $this.css("flex-grow")
            if ($this.hasClass("splitter__part")) {
                if (flex_basis == "auto") {
                    throw "splitter__part elements " +
                      "cannot have 'auto' flex-basis";
                }
                stat.basis += parseFloat(flex_basis);
                stat.grow += parseFloat(flex_grow);
                stat.part_count += 1;
            } else {
                if (flex_grow != "0") {
                    throw "non-splitter__part elements " +
                      "must have zero flex-grow";
                }
                stat.basis += is_vertical ? $this.width() : $this.height()
            }
        });
        return stat;
    }

    function resize($splitter) {
        let flex = collect_flex_stat($splitter.children());
        let $parts = $splitter.children(".splitter__part");
        if (flex.grow <= 0) {
            $parts.each(function() {
                $(this).css("flex-grow", 1.0);
            });
        } else {
            $parts.each(function() {
                let $this = $(this);
                $this.css( "flex-grow",
                  flex.part_count * $this.css("flex-grow") / flex.grow );
            });
        }
    }

    function get_flex_portion($splitter_part) {
        let flex = collect_flex_stat($splitter_part.parent().children());
        return flex.grow > 0 ?
            ($splitter_part.css("flex-grow") / flex.grow) :
            (1 / flex.part_count);
    }

    function set_flex_portion($splitter_part, portion) {
        let $other_parts =
          $splitter_part.parent().children().not($splitter_part);
        let flex = collect_flex_stat($other_parts);
        if (portion < 1) {
            $splitter_part.css( "flex-grow",
                flex.grow * portion / (1 - portion) );
        } else {
            $other_parts.filter(".splitter__part").css("flex-grow", 0.0);
            $splitter_part.css("flex-grow", flex.count + 1);
        }
    }

    $(window).mouseup(deactivate);
    $overlay.mouseup(deactivate);
    $overlay.mouseleave(deactivate);
    $(window).mousemove(move_it);

    return {
      enable: enable,
      resize: resize,
      get_flex_portion: get_flex_portion,
      set_flex_portion: set_flex_portion,
    };
}(); /* }}} */
separators.enable($(".splitter__separator"))

/*
 * sources.toggle_file_menu()
 */
const sources = function() { /* namespace {{{ */
    const $pane = $("#source_pane");
    const $file_pane = $("#file_pane");
    var $current_menu = null, menu_flex_portion = (3 - Math.sqrt(5))/2;
    var current_project = null;
    var projects_db = null;
    open_projects_db();

    $("#pane_separator")
      .on("separator:deactivate", resize_editors);

    /* {{{
     *  IndexedDB 'projects'
     *    object store 'projects'
     *      <name> : {
     *        info: {
     *          name: <name>,
     *          editor: {    // only for stored project
     *            open: ["main.asy"],    // in order
     *            focus: "main.asy",
     *          },
     *          compiler: { last_run: "main.asy" },
     *        },
     *        files: {
     *          "main.asy": {
     *            content: <content>,
     *                // only for stored file
     *                // (i. e. stored project or file is not open)
     *            editor: <editor>,
     *                // only for open files in current project
     *            info: {
     *              name: "main.asy",
     *              editor: {
     *                  // only for stored file
     *                flex_grow: 1.0,
     *                position: {row: <number>, column: <number>},
     *              }
     *              compiler: {
     *                runnable: true
     *              }
     *            }
     *          }
     *        }
     *      }
     *
     *  localStorage
     *    current_project: <name>
     *
     * }}} */

    function open_projects_db() { /* {{{ */
        if (!window.indexedDB) {
            open_projects_db_fail();
            return;
        }
        let request = indexedDB.open("projects", 2);
        request.onupgradeneeded = function(event) {
            let projects_db = event.target.result;
            if (event.oldVersion < 2) {
                // 'projects' object store structure has changed
                if (projects_db.objectStoreNames.contains("projects")) {
                    projects_db.deleteObjectStore("projects");
                }
                let projects_store = projects_db.createObjectStore(
                    "projects", { keyPath: "info.name" } );
            }
        }
        request.onsuccess = function(event) {
            projects_db = event.target.result;
            autoload();
        }
        request.onerror = function(event) {
            open_projects_db_fail();
            autoload();
        }
    } /* }}} */
    function open_projects_db_fail() { /* {{{ */
        console.log("Saving and loading is disabled. " +
            "(IndexedDB capability unavailable.)" );
    } /* }}} */

    function autoload() { /* {{{ */
        if (!projects_db)
            return autoload_default();
        var project_name;
        if (window.localStorage) {
            project_name = ( localStorage.getItem("current_project") ||
                "default" );
        } else {
            project_name = "default"
        }
        let transaction = projects_db.transaction(
            ['projects'], 'readonly' );
        let projects_store = transaction.objectStore('projects');
        function autoload_name(project_name) {
            let request = projects_store.get(project_name);
            request.onsuccess = function(event) {
                let project = event.target.result;
                if (!project) {
                    if (project_name != "default")
                        return autoload_name("default");
                    else
                        return autoload_default();
                }
                let open_list = project.info.editor.open;
                for (let open_i = 0; open_i < open_list.length; ++open_i) {
                    let name = open_list[open_i];
                    let file = project.files[name];
                    let editor = open_editor(file);
                }
                if (project.info.editor.focus)
                    project.files[project.info.editor.focus].editor.focus();
                delete project.info.editor;
                current_project = project;
                if (
                    Object.keys(project.files).length == 1 &&
                    project.files["main.asy"] &&
                    project.files["main.asy"].editor
                ) {
                    $('.file[data-filename="main.asy"').addClass("file--single")
                    resize_editors();
                }
            };
        }
        autoload_name(project_name);
    } /* }}} */
    function autoload_default() { /* {{{ */
        let file = {
          content: "size(7cm);\n\n",
          info: {
            name: "main.asy",
            compiler: { runnable: true },
          },
        };
        let editor = open_editor(file);
        editor.selection.moveCursorFileEnd();
        current_project = {
            info: {
                name: "default",
                compiler: { last_run: null },
            },
            files: {
                "main.asy": file
            },
        };
        editor.focus();
        $('.file[data-filename="main.asy"').addClass("file--single")
        resize_editors();
    } /* }}} */

    function open_editor(file) { /* {{{ */
        file.editor = true;
        let editor_id = "editor:" + file.info.name;
        let $editor = $("<div/>")
          .addClass("file__editor")
          .attr('id', editor_id)
        let $header = make_file_header(file);
        let $file = $('<div/>')
          .addClass("splitter__part")
          .addClass("file")
          .attr('data-filename', file.info.name)
          .append($header)
          .append($editor)
          .appendTo($file_pane);
        let $separator = $('<div/>')
          .addClass("splitter__separator")
          .on("separator:move", resize_editors)
          .appendTo($file_pane);
        separators.enable($separator);
        let editor = ace.edit(editor_id);
        editor.setTheme("ace/theme/terminal");
        editor.session.setMode("ace/mode/asymptote");
        editor.commands.addCommand({
          name: 'asycompile',
          bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
          exec: function() {
              if (file.info.compiler.runnable)
                  request_compile(file.info.name);
              else
                  request_compile();
          },
        });
        if (file.content) {
            editor.setValue(file.content);
            editor.selection.clearSelection();
        }
        delete file.content;
        file.editor = editor;
        if (file.info.compiler.runnable == true) {
            $file.addClass("file--runnable");
        }
        if (file.info.editor) {
            if (file.info.editor.flex_grow != null) {
                $file.css("flex-grow", file.info.editor.flex_grow);
            }
            let position = file.info.editor.position;
            if (position) {
                editor.selection.moveCursorToPosition(position);
            } else {
                editor.selection.moveCursorFileEnd();
            }
        }
        delete file.info.editor;
        return editor;
    } /* }}} */
    function make_file_header(file) { /* {{{ */
        let $header = $("<div/>")
          .addClass("file_header")
          .attr('data-filename', file.info.name)
          .append(
            $("<span/>")
              .addClass("file_header__caption")
              .text(file.info.name)
          );
        if (!file.editor)
            $header.addClass("file_header--hidden");
        if (file.info.compiler.runnable == true) {
            $header.addClass("file_header--runnable");
        }
        let $buttons = $("<div/>")
          .addClass("file_header__buttons");
        $("<div/>")
          .addClass("file_header__runnable_button")
          .attr( "title", file.info.compiler.runnable ?
            "mark the file as auxiliary" : "mark the file as runnable"
          )
          .click(function() {
              if (file.info.compiler.runnable) {
                  file.info.compiler.runnable = false;
                  $('.file[data-filename="' + file.info.name + '"')
                    .removeClass("file--runnable");
                  $('.file_header[data-filename="' + file.info.name + '"')
                    .removeClass("file_header--runnable");
              } else {
                  file.info.compiler.runnable = true;
                  $('.file[data-filename="' + file.info.name + '"')
                    .addClass("file--runnable");
                  $('.file_header[data-filename="' + file.info.name + '"')
                    .addClass("file_header--runnable");
              }
          })
          .appendTo($buttons);
        $("<div/>")
          .addClass("file_header__delete_button")
          .click(function() {
              let $this = $(this);
              if (!$this.hasClass("file_header__delete_button--sure")) {
                  $this.addClass("file_header__delete_button--sure");
                  return;
              }
              delete_file(file);
          })
          .mouseleave(function() {
            $(this).removeClass("file_header__delete_button--sure");
          })
          .appendTo($buttons);
        $header.append($buttons);
        return $header;
    } /* }}} */
    function resize_editors() { /* {{{ */
        for (let filename in current_project.files) {
            let file = current_project.files[filename];
            if (file.editor) {
                file.editor.resize();
            }
        }
    } /* }}} */
    function clear_editors() { /* {{{ */
        // XXX
    } /* }}} */
    function delete_file(file) { /* {{{ */
        if (file.editor) {
            file.editor.destroy();
        }
        delete current_project.files[file.info.name];
        $('.file[data-filename="' + file.info.name + '"')
          .next(".splitter__separator").addBack()
            .remove();
        $('.file_header[data-filename="' + file.info.name + '"').remove();
    } /* }}} */

    function request_compile(main_filename) { /* {{{ */
        if (main_filename != null) {
            current_project.info.compiler.last_run = main_filename;
        } else if (current_project.info.compiler.last_run == null) {
            return window.alert("Select a main file to compile.")
        } else {
            main_filename = current_project.info.compiler.last_run;
        }
        autosave();
        let compile_data = {
            info: { main: main_filename },
            files: {},
        };
        for (let filename in current_project.files) {
            let current_file = current_project.files[filename];
            if (current_file.content != null) {
                compile_data.files[filename] = current_file.content;
            } else {
                compile_data.files[filename] = current_file.editor.getValue();
            }
        }
        return output.compile(compile_data);
    } /* }}} */

    function autosave() { /* {{{ */
        if (!projects_db)
            return;
        let transaction = projects_db.transaction(
            ['projects'], 'readwrite' );
        let projects_store = transaction.objectStore('projects');
        let stored_project = {
            info: {
                name: current_project.info.name,
                editor: {
                    open: [],
                    focus: null,
                },
                compiler: current_project.info.compiler,
            },
            files: {},
        };
        $file_pane.children(".file").each(function() {
            stored_project.info.editor.open.push(
                $(this).attr("data-filename") );
        });
        for (let filename in current_project.files) {
            let current_file = current_project.files[filename];
            if (current_file.content != null) {
                stored_project.files[filename] = current_file;
                continue;
            }
            let editor = current_file.editor;
            if (editor.isFocused()) {
                stored_project.info.editor.focus = filename;
            }
            let editor_position = editor.selection.getCursor();
            stored_project.files[filename] = {
                content: editor.getValue(),
                info: {
                    name: filename,
                    editor: {
                        flex_grow:
                          $file_pane.children(
                              '.file[data-filename="' + filename + '"]' )
                            .css("flex-grow"),
                        position: {
                            row: editor_position.row,
                            column: editor_position.column,
                        },
                    },
                    compiler: current_file.info.compiler,
                },
            }
        }
        let request = projects_store.put(stored_project);
        request.onsuccess = function(event) {
            localStorage.setItem("current_project", stored_project.info.name);
        };
        request.onerror = function(event) {
            console.log("Autosave failed:", event.target.error);
        };
    } /* }}} */

    function toggle_file_menu() { /* {{{ */
        if ($current_menu != null) {
            if ($current_menu.attr("data-menu_type") == "file") {
                close_menu();
                return;
            } else {
                close_menu();
            }
        }
        open_file_menu();
    } /* }}} */

    function open_file_menu() { /* {{{ */
        if ($current_menu != null) {
            throw "interal error: menu already active";
        }
        let $menu = $("<div/>")
          .addClass("file_menu")
          .attr("data-menu_type", "file");
        let filelist = [];
        for (let filename in current_project.files) {
            filelist.push(current_project.files[filename]);
        }
        filelist.sort(function(a, b) {
            let aname = a.info.name, bname = b.info.name;
            if (aname < bname)
                return -1;
            if (aname > bname)
                return 1;
            return 0;
        });
        filelist.forEach(function(file) {
            make_file_header(file).appendTo($menu);
        });
        { // $file_adder
            let $file_adder = $('<input/>')
              .attr("id", "file_adder")
              .addClass("file_menu__adder")
              .attr("placeholder", "new_file.asy")
              .on("keyup", function(event) {
                  if (event.keyCode == 13) {
                      let filename = $file_adder.val();
                      if (!filename.endsWith(".asy")) {
                          filename = filename + ".asy";
                      }
                      add_new_file(filename);
                      $file_adder.val("");
                  }
              });
            $file_adder.appendTo($menu);
        }
        $menu
          .addClass("splitter__part")
          .appendTo($pane);
        $current_menu = $menu;
        separators.set_flex_portion($menu, menu_flex_portion);
        $("#file_menu_button").addClass("active");
    } /* }}} */
    function add_new_file(filename) { /* {{{ */
        if (current_project.files[filename]) {
            window.alert("File " + filename + " already exists."); // XXX
            return;
        }
        // XXX also check for .asy extension
        let file = {
          info: {
            name: filename,
            compiler: {
              runnable: true,
            },
          },
        };
        current_project.files[filename] = file;
        open_editor(file);
        make_file_header(file).insertBefore("#file_adder");
        $(".file.file--single").removeClass("file--single");
    } /* }}} */

    function close_menu() { /* {{{ */
        if ($current_menu == null) {
            throw "interal error: menu not active";
        }
        menu_flex_portion = separators.get_flex_portion($current_menu);
        let menu_type = $current_menu.attr("data-menu_type");
        $('.menu_button[data-menu_type="' + menu_type + '"]')
            .removeClass("active");
        $current_menu.remove();
        $current_menu = null;
        separators.resize($pane);
        resize_editors();
    } /* }}} */

    return { toggle_file_menu: toggle_file_menu };
}(); /* }}} */

/*
 * output.compile();
 */
const output = function() { /* namespace {{{ */
    var $output = $("#output");
    var current_request = null;
    var current_compile_data = null;
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
        let $error_part = $('<div/>')
            .addClass('output__part output__part--error');
        let $error_data = $('<span/>')
            .addClass('output__data output__data--error')
            .text(text)
            .appendTo($error_part);
        $output.append($error_part);
    }

    function append_help() {
        $output.append(
          $('<div/>')
            .addClass('output__part output__part--error')
            .text("Press Ctrl-Enter to compile your Asymptote code.")
        );
    }

    function compile(compile_data) {
        if (current_request != null) {
            return abort_request();
        }
        let request = new XMLHttpRequest();
        current_request = request;
        current_compile_data = compile_data;
        let formdata = new FormData();
        if (!compile_data.info.main)
            throw "internal error: invalid compile data";
        formdata.append("info", JSON.stringify(compile_data.info));
        for (let filename in compile_data.files) {
            formdata.append(filename, compile_data.files[filename]);
        }
        request.addEventListener('load', compile_finish);
        request.addEventListener('error', request_fail);
        request.open("POST", "/compile/svg", /* async = */ true);
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
        separators.resize($output);
    }

    function get_save_part(svg_data) {
        let $save_part = $('<div/>')
          .addClass('output__part output__part--save')
        let $save_button = $('<a/>')
          .addClass('output__data button')
          .text("Save to file")
          .appendTo($save_part);
        $save_button.click(function() {
            let url = file_urls.get( 'svg',
              new Blob([svg_data], {type: 'image/svg+xml'}) );
            let $save_link = $('<a/>')
              .addClass('output__data')
              .attr('href', url)
              .attr('download', 'image.svg')
              .text("Save to SVG file");
            let $pdf_button = $('<a/>')
              .attr("id", "output_pdf_button")
              .addClass('output__data button')
              .text("Request PDF file")
              .click(function() { return compile_pdf(); });
            $save_button
              .after($save_link, $pdf_button)
              .remove();
        });
        return $save_part;
    }

    function compile_pdf(compile_data) {
        if (current_request != null) {
            return abort_request();
        }
        let request = new XMLHttpRequest();
        current_request = request;
        if (compile_data == null) {
            compile_data = current_compile_data;
        }
        console.log(compile_data);
        let formdata = new FormData();
        if (!compile_data.info.main)
            throw "internal error: invalid compile data";
        formdata.append("info", JSON.stringify(compile_data.info));
        for (let filename in compile_data.files) {
            formdata.append(filename, compile_data.files[filename]);
        }
        request.addEventListener('load', compile_pdf_finish);
        request.addEventListener('error', compile_pdf_fail);
        request.responseType = "blob";
        request.open("POST", "/compile/pdf", /* async = */ true);
        request.send(formdata);
        let $pdf_link = $('<a/>')
          .attr("id", "output_pdf_link")
          .addClass("output__data")
          .text("loading PDF…");
        $("#output_pdf_button")
          .after($pdf_link)
          .remove();
    }

    function compile_pdf_finish() {
        if (this !== current_request) {
            return;
        }
        current_request = null;
        file_urls.revoke('pdf');
        let response_type = this.getResponseHeader("Content-Type");
        if (!response_type.startsWith("application/pdf")) {
            return compile_pdf_fail();
        }
        let response = this.response;
        let url = file_urls.get('pdf', response, {type: 'application/pdf'});
        $("#output_pdf_link")
          .attr("href", url)
          .attr("download", "image.pdf")
          .text("Save to PDF file");
    }

    function compile_pdf_fail() {
        $("#output_pdf_link")
          .addClass("output__data--error")
          .text("error loading PDF");
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
