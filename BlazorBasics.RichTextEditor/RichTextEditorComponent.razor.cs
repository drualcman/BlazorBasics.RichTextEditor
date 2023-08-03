namespace BlazorBasics.RichTextEditor;
public partial class RichTextEditorComponent : IAsyncDisposable
{
    [Inject] public IJSRuntime JSRuntime { get; set; }
    [Parameter, EditorRequired] public MarkupString Html { get; set; }
    [Parameter] public bool HideSaveButton { get; set; }
    [Parameter] public bool HideImageButton { get; set; }
    [Parameter] public bool AvoidPasteImages { get; set; }
    [Parameter] public EventCallback<string> OnSave { get; set; }
    [Parameter] public Func<FileUpload, Task<string>> UploadFile { get; set; }
    [Parameter(CaptureUnmatchedValues = true)] public Dictionary<string, object> AdditionalAttributes { get; set; }

    #region variables
    private Lazy<Task<IJSObjectReference>> ModuleTask;
    string EditorId = $"{Guid.NewGuid()}";
    DotNetObjectReference<RichTextEditorComponent> ObjRef;
    bool EditorReady = false;
    #endregion

    #region Overrides
    private Task<IJSObjectReference> GetJSObjectReference(IJSRuntime jsRuntime) =>
        jsRuntime.InvokeAsync<IJSObjectReference>(
            "import", $"./{ContentHelper.ContentPath}/js/htmlEditorService.js").AsTask();
    protected override void OnInitialized()
    {
        ModuleTask = new Lazy<Task<IJSObjectReference>>(() => GetJSObjectReference(JSRuntime));
    }

    protected override async Task OnParametersSetAsync()
    {
        if(!EditorReady)
            await CreateEditor();
    }
    #endregion

    #region IAsyncDisposable        
    public async ValueTask DisposeAsync()
    {
        ObjRef?.Dispose();
        IJSObjectReference module = await ModuleTask.Value;
        try
        {
            await module.InvokeVoidAsync("deleteEditor", EditorId);
        }
        catch(Exception ex)
        {
            Console.WriteLine($"Html editor: {ex}");
        }
    }
    #endregion

    #region Methods 
    async Task CreateEditor()
    {
        IJSObjectReference module = await ModuleTask.Value;
        try
        {
            ObjRef = DotNetObjectReference.Create(this);
            await module.InvokeVoidAsync("createEditor", EditorId, ObjRef, !HideSaveButton, !HideImageButton, AvoidPasteImages);
            EditorReady = true;
        }
        catch(Exception ex)
        {
            ObjRef = null;
            await Console.Out.WriteAsync(ex.ToString());
        }
        if(EditorReady)
        {
            if(UploadFile != null)
            {
                try
                {
                    await module.InvokeVoidAsync("setFileUploadHelper", EditorId, nameof(OnUpload_Click));
                }
                catch(Exception ex)
                {
                    Console.WriteLine($"Html editor setFileUploadHelper: {ex}");
                }
            }
        }
    }

    public async Task GetContent()
    {
        IJSObjectReference module = await ModuleTask.Value;
        try
        {
            await module.InvokeVoidAsync("getContent", EditorId);
        }
        catch(Exception ex)
        {
            Console.WriteLine($"Html editor GetContent: {ex}");
        }
    }
    #endregion

    #region Javascript events
    [JSInvokable]
    public async Task OnSave_Click(string e)
    {
        if(OnSave.HasDelegate)
        {
            await OnSave.InvokeAsync(ContentHelper.CheckIfHaveContent(e));
        }
    }

    [JSInvokable]
    public async Task<string> OnUpload_Click(FileSelected file)
    {
        string result = string.Empty;
        if(!string.IsNullOrEmpty(file.ImageBase64) && UploadFile != null)
        {
            string fileBase64 = file.ImageBase64.Split(',')[1];
            FileUpload toUpload = new FileUpload(file.FileName, Convert.FromBase64String(fileBase64));
            result = await UploadFile.Invoke(toUpload);
        }
        return result;
    }
    #endregion
}
