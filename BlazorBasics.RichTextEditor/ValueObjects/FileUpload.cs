namespace BlazorBasics.RichTextEditor.ValueObjects;
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
