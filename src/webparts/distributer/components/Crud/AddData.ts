import { getDigest } from "./GetDigest";

export async function handleAddItem(
  title: string,
  setState: (state: any) => void,
  onReload: () => void
) {
  const listName = "shoping";
  const itemType = `SP.Data.${listName}ListItem`;
  const webUrl = "https://crm.zarsim.com";

  if (!title.trim()) {
    setState({ message: "لطفاً یک عنوان وارد کنید." });
    return;
  }

  try {
    const digest = await getDigest();

    await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest,
      },
      body: JSON.stringify({
        __metadata: { type: itemType },
        Title: title,
      }),
    });

    setState({ message: `آیتم جدید (${title}) اضافه شد.`, title: "" });
    onReload();
  } catch (err) {
    setState({ message: `خطا: ${err.message}` });
  }
}
