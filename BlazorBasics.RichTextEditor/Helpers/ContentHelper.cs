using System.Text.RegularExpressions;

namespace BlazorBasics.RichTextEditor.Helpers;
internal static class ContentHelper
{
    public static string ContentPath => $"_content/{typeof(ContentHelper).Assembly.GetName().Name}";
    public static string ReplaceSpaceWithPlus(this string text)
    {
        string result;
        if(string.IsNullOrEmpty(text)) result = text;
        else result = text.Replace(' ', '+');
        return result;
    }

    public static string CheckIfHaveContent(string content)
    {
        Regex regex = new Regex("(?<=>)[^<]+");
        var matchs = regex.Matches(content);
        int totalLines = matchs.Count();
        int c = 0;
        bool hasContent = false;
        if(totalLines > 0)
        {
            do
            {
                hasContent = CheckIfHasContent(matchs[c].Value);
                c++;
            } while(CanContinues(c < totalLines, hasContent));
        }
        return hasContent ? content : "";
    }

    private static bool CheckIfHasContent(string content)
    {
        bool result;
        if(string.IsNullOrWhiteSpace(content)) result = false;
        else if(content.ToLower() == "<br/>") result = false;
        else result = true;
        return result;
    }

    private static bool CanContinues(bool loop, bool hasContent) =>
        loop && hasContent == false;
}
