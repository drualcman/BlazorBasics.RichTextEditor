import * as E from "./quill136.js"

const editors = new Map();            // new Dictionary<string, object> in c#

const createEditor = (editorId, dotNet, showSaveButton, showImageButton, avoidPasteImages) => {
    var container = document.getElementById(`${editorId}`);
    var toolbarOptions = [

        [{ 'font': [] }],
        [{ 'align': [] }],

        [{ 'header': 1 }, { 'header': 2 }, { 'header': [1, 2, 3, 4, 5, 6, false] }],

        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],

        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent

        [{ 'color': [] }, { 'background': [] }, 'clean'],          // dropdown with defaults from theme

        ['link']                                   // links
    ];

    if (showSaveButton) {
        toolbarOptions.unshift(['save']);
    }

    if (showImageButton) {
        toolbarOptions.push(['image']);
    }

    var options = {
        debug: 'error',
        modules: {
            toolbar: toolbarOptions,
            history: {
                delay: 2000,
                maxStack: 100,
                userOnly: true
            }
        },
        placeholder: 'A long time ago in a galaxy far, far away....',
        readOnly: false,
        theme: 'snow'
    };
    var editor = new Quill(container, options);
    editor.dotNetObjectReference = dotNet;

    if (showSaveButton) {
        AddSaveButtonEvent(editor);
    }
    if (showImageButton) {
        AddPictureHandler(editor);
    }
    if (avoidPasteImages) {
        //avoid can paste images from a clipboard
        editor.clipboard.addMatcher('IMG', (node, delta) => {
            const Delta = Quill.import('delta')
            return new Delta().insert('')
        });
        editor.clipboard.addMatcher('PICTURE', (node, delta) => {
            const Delta = Quill.import('delta')
            return new Delta().insert('')
        });
    }

    editors.set(editorId, editor);
    console.info(`editor ${editorId} created.`);
}

function AddSaveButtonEvent(editor) {
    var saveButton = editor.getModule('toolbar').container.querySelector('.ql-save');
    saveButton.title = 'Save to cloud';
    saveButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM272 80v80H144V80h128zm122 352H54a6 6 0 0 1-6-6V86a6 6 0 0 1 6-6h42v104c0 13.255 10.745 24 24 24h176c13.255 0 24-10.745 24-24V83.882l78.243 78.243a6 6 0 0 1 1.757 4.243V426a6 6 0 0 1-6 6zM224 232c-48.523 0-88 39.477-88 88s39.477 88 88 88 88-39.477 88-88-39.477-88-88-88zm0 128c-22.056 0-40-17.944-40-40s17.944-40 40-40 40 17.944 40 40-17.944 40-40 40z"/></svg>';
    saveButton.addEventListener('click', function (e) {
        if (editor.dotNetObjectReference !== null && editor.dotNetObjectReference !== undefined)
            editor.dotNetObjectReference.invokeMethodAsync('OnSave_Click', editor.root.innerHTML);
    });
}

function AddPictureHandler(editor) {
    editor.getModule('toolbar').addHandler('image', () => {
        selectLocalImage(editor);
    });
}

function selectLocalImage(editor) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    // Listen upload local image and save to server
    input.onchange = () => {
        const file = input.files[0];

        // file type is only image.
        if (/^image\//.test(file.type)) {
            saveToServer(editor, file);
        } else {
            console.warn('You could only upload images.');
        }
    };
}

function saveToServer(editor, file) {
    if (editor.uploadHandler) {
        try {
            let dotNet = editor.dotNetObjectReference;
            let uploadHandler = editor.uploadHandler;
            if (dotNet !== null && dotNet !== undefined && uploadHandler) {
                insertBase64Image(editor, file, (sender, base64) => {
                    let toSend = {
                        FileName: file.name,
                        ImageBase64: base64
                    };
                    dotNet.invokeMethodAsync(uploadHandler, toSend).then((uri) => {
                        if (uri) {
                            insertToEditor(sender, uri);
                        }
                        else {
                            insertBase64Image(editor, file, insertToEditor);
                        }
                    });
                });
            }
            else
                insertBase64Image(editor, file, insertToEditor);
        } catch (e) {
            console.warn('saveToServer', e);
            insertBase64Image(editor, file, insertToEditor);
        }
    }
    else {
        insertBase64Image(editor, file, insertToEditor);
    }
}

function insertBase64Image(editor, file, callBack) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const base64String = event.target.result;
        callBack(editor, base64String);
    };
    reader.readAsDataURL(file);
}

function insertToEditor(editor, url) {
    // push image url to rich editor.
    const range = editor.getSelection();
    editor.insertEmbed(range.index, 'image', `${url}`);
}

const deleteEditor = (editorId) => {
    editors.delete(editorId);
    console.info(`editor ${editorId} removed.`);
}

const setFileUploadHelper = (editorId, uploadHandler) => {
    let editor = editors.get(editorId);
    editor.uploadHandler = uploadHandler;
}

const getContent = (editorId) => {
    let editor = editors.get(editorId);
    if (editor.dotNetObjectReference !== null && editor.dotNetObjectReference !== undefined)
        editor.dotNetObjectReference.invokeMethodAsync('OnSave_Click', editor.root.innerHTML);
}

export { createEditor, deleteEditor, setFileUploadHelper, getContent }