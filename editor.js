var newButton, openButton, saveButton;
var editor;
var fileEntry;
var hasWriteAccess;

var gui = require("nw.gui");

var fs = require("fs");
var Backbone = require('backbone');
var _ = require("underscore");
var S = require('string');
var m = require('./allmodes')
var clipboard = gui.Clipboard.get();
var shell = require('shelljs');

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  exit(1);
}

function handleDocumentChange(title) {
    var mode = "javascript";
    var modeName = "JavaScript";
    if (title) {
        title = title.match(/[^/]+$/)[0];
        document.getElementById("title").innerHTML = title;
        document.title ="Lumia"+title;
        _.each(m.allmodes, function(modes) {
            if (S(title).contains(modes["filename"])) {
                mode = modes["mode"];
                modeName = modes["modeName"];
                console.log(mode.green);
            }
        });
    } else {
        document.getElementById("title").innerHTML = "[no document loaded]";
    }
    editor.setOption("mode", mode);
    document.getElementById("mode").innerHTML = modeName;
}

function newFile() {
    fileEntry = null;
    hasWriteAccess = false;
    handleDocumentChange(null);
}

function setFile(theFileEntry, isWritable) {
    fileEntry = theFileEntry;
    hasWriteAccess = isWritable;
}

function readFileIntoEditor(theFileEntry) {
    fs.readFile(theFileEntry, function(err, data) {
        if (err) {
            console.log("Read failed: " + err);
        }

        handleDocumentChange(theFileEntry);
        editor.setValue(String(data));
        fileEntry = theFileEntry;
    });
}

function writeEditorToFile(theFileEntry) {
    var str = editor.getValue();
    fs.writeFile(theFileEntry, editor.getValue(), function(err) {
        if (err) {
            console.log("Write failed: " + err);
            return;
        }

        handleDocumentChange(theFileEntry);
        document.getElementById("filestatus").innerHTML = "Save Completed";
        console.log("Write completed.");
      
    });
}

var onChosenFileToOpen = function(theFileEntry) {
    setFile(theFileEntry, false);
    console.log(theFileEntry);
    readFileIntoEditor(theFileEntry);
};

var onChosenFileToSave = function(theFileEntry) {
    setFile(theFileEntry, true);
    console.log(theFileEntry);
    writeEditorToFile(theFileEntry);
};

function handleNewButton() {
    if (false) {
        newFile();
        editor.setValue("");
    } else {
        var x = window.screenX + 10;
        var y = window.screenY + 10;
        window.open('index.html', '_blank', 'screenX=' + x + ',screenY=' + y);
    }
}

function handleOpenButton() {
    $("#openFile").trigger("click");
}

function handleSaveButton() {
    if (fileEntry && hasWriteAccess) {
        writeEditorToFile(fileEntry);
    } else {
        $("#saveFile").trigger("click");
    }
}

onload = function() {
  
    newButton = document.getElementById("new");
    openButton = document.getElementById("open");
    saveButton = document.getElementById("save");

    newButton.addEventListener("click", handleNewButton);
    openButton.addEventListener("click", handleOpenButton);
    saveButton.addEventListener("click", handleSaveButton);

    $("#saveFile").change(function(evt) {
        onChosenFileToSave($(this).val());
    });
    $("#openFile").change(function(evt) {
        onChosenFileToOpen($(this).val());
    });    
    editor = CodeMirror(
        document.getElementById("editor"), {
            lineNumbers: true,
            keyMap: "sublime",
            autoCloseBrackets: true,
            matchBrackets: true,
            showCursorWhenSelecting: true,
            extraKeys: {
                "Cmd-N": function(instance) {
                    handleNewButton()
                },
                "Ctrl-N": function(instance) {
                    handleNewButton()
                },
                "Cmd-O": function(instance) {
                    handleOpenButton()
                },
                "Ctrl-O": function(instance) {
                    handleOpenButton()
                },
                "Cmd-S": function(instance) {
                    handleSaveButton()
                },
                "Ctrl-S": function(instance) {
                    handleSaveButton()
                },
                "Cmd-Shift-P": function(instance) {
                   console.log("hello".green)
                }
            }
        });
    newFile();
    onresize();

    gui.Window.get().show();
};

onresize = function() {
    var container = document.getElementById("editor");
    var containerWidth = container.offsetWidth;
    var containerHeight = container.offsetHeight - 32;
    console.log(containerHeight);

    var scrollerElement = editor.getScrollerElement();
    scrollerElement.style.width = containerWidth + 'px';
    scrollerElement.style.height = containerHeight + 'px';

    editor.refresh();
    editor.setSize("100%", containerHeight)
}