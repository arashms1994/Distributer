export async function loadItems(): Promise<any[]> {
  const webUrl = "https://crm.zarsim.com";
  const listName = "Store";

  try {
    const response = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    );

    const data = await response.json();
    return data.d.results;
  } catch (err) {
    console.error("خطا در دریافت آیتم‌ها:", err);
    return [];
  }
}

export async function loadItemByCode(code: string) {
  const webUrl = "https://crm.zarsim.com";
  const listName = "Store";
  const encodedCode = encodeURIComponent(code);

  try {
    const response = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=Code eq '${encodedCode}'`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    );

    if (!response.ok) {
      throw new Error("دریافت اطلاعات محصول با خطا مواجه شد");
    }

    const data = await response.json();
    return data.d.results[0];
  } catch (err) {
    console.error("خطا در دریافت آیتم:", err);
    throw err;
  }
}

export async function loadCard(filterGuidForm: string): Promise<any[]> {
  const webUrl = "https://crm.zarsim.com";
  const listName = "shoping";

  try {
    const response = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=guid_form eq '${filterGuidForm}'`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    );

    const data = await response.json();

    return data.d.results;
  } catch (err) {
    console.error("خطا در دریافت آیتم‌ها:", err);
    return [];
  }
}

export async function checkCartForItem(
  code: string,
  userGuid: string | null
): Promise<number | null> {
  const webUrl = "https://crm.zarsim.com";
  const listName = "shoping";

  const res = await fetch(
    `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=guid_form eq '${userGuid}' and codegoods eq '${code}'`,
    {
      headers: {
        Accept: "application/json;odata=verbose",
      },
    }
  );

  const data = await res.json();
  if (data.d.results.length > 0) {
    return data.d.results[0].ID;
  }

  return null;
}

export async function loadImages(): Promise<any[]> {
  const folderUrl = "/Shared Documents";
  const webUrl = "https://crm.zarsim.com";

  const response = await fetch(
    `${webUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')/Files`,
    {
      method: "GET",
      headers: {
        Accept: "application/json;odata=verbose",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch files: ${text}`);
  }

  const data = await response.json();
  const files = data.d.results;

  const images = files.filter(
    (file) =>
      file.Name.endsWith(".jpg") ||
      file.Name.endsWith(".jpeg") ||
      file.Name.endsWith(".png")
  );

  return images.map((file) => ({
    name: file.Name,
    url: file.ServerRelativeUrl,
  }));
}
