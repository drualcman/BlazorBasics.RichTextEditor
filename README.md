[![Nuget](https://img.shields.io/nuget/v/BlazorBasics.RichTextEditor?style=for-the-badge)](https://www.nuget.org/packages/BlazorBasics.RichTextEditor)
[![Nuget](https://img.shields.io/nuget/dt/BlazorBasics.RichTextEditor?style=for-the-badge)](https://www.nuget.org/packages/BlazorBasics.RichTextEditor)

# Description
A simple Rich Text Editor for Blazor Server or Blazor WebAssembly applications. This rich text editor is based in [Quill](https://quilljs.com/) JavaScript.

# How to use
Nugget installation
```PM> Install-Package BlazorBasics.RichTextEditor```
Or clone the [repository](https://github.com/drualcman/BlazorBasics.RichTextEditor) and add the project to your solution.<br/>
Add the component where you want to show rich text editor like this example:
``` RAZOR
<RichTextEditorComponent Html=HtmlMarkupString OnSave="SaveHtml"/>

@code{
	MarkupString HtmlMarkupString = 
		new MarkupString("<p>A long time ago in a galaxi far, far away...</p>");
	
	void SaveHtml(string html){
		//process your data
	}
}
```
## Options
* Disable paste images if you don't like to allow base64 image insert into the document
* Show/Hide Images button to allow or not user can insert images
* You can use your API to upload images
* Show/Hide Save button into the menu
## Upload Images to the API
You will receive a object from the editor like
``` CSHARP
public class FileUpload
{
    public string FileName { get; set; }
    public byte[] FileBytes { get; set; }

    public FileUpload(string fileName, byte[] fileBytes)
    {
        FileName = fileName;
        FileBytes = fileBytes;
    }
}
```
Then need a Task to return a string with the URL about where is located the image. If don't return a url and return string.Empty editor add the image into de document like a image/base64 but you also can manage the image, to register in a database for example.
``` RAZOR
<RichTextEditorComponent Html=HtmlMarkupString OnSave="SaveHtml" UploadFile=UploadFile/>

@code{
	MarkupString HtmlMarkupString = 
		new MarkupString("<p>A long time ago in a galaxi far, far away...</p>");
	
	void SaveHtml(string html){
		//process your data
	}

    async Task<string> UploadFile(FileUpload file)
    {          
        string url = await YourApiToUploadFiles.SaveFile(file);
		return url;
    }
}
```

## Disable upload and paste images
``` RAZOR
<RichTextEditorComponent Html=HtmlMarkupString OnSave="SaveHtml" HideImageButton=true AvoidPasteImages=true/>

@code{
	MarkupString HtmlMarkupString = 
		new MarkupString("<p>A long time ago in a galaxi far, far away...</p>");
	
	void SaveHtml(string html){
		//process your data
	}
}
```
## If you want to use a external save button
If you want to use external save button it's much better use the property HideSaveButton=true to avoid user can see 2 save buttons, into the editor and outside the editor
``` RAZOR
<RichTextEditorComponent Html=HtmlMarkupString OnSave="SaveHtml" @ref=Editor HideSaveButton=true />

<button @onclick=Save>Save</button>

@code{
	RichTextEditorComponent Editor;
	MarkupString HtmlMarkupString = 
		new MarkupString("<p>A long time ago in a galaxi far, far away...</p>");
	string Html;

	void SaveHtml(string html){
		Html = html;
	}

	async Task Save(){
		await Editor.GetContent();
		//process your data
	}
}
```

