export async function getDigest(): Promise<string> {
  const webUrl = "https://crm.zarsim.com";
  return fetch(`${webUrl}/_api/contextinfo`, {
    method: "POST",
    headers: { Accept: "application/json;odata=verbose" },
  })
    .then((res) => res.json())
    .then((data) => data.d.GetContextWebInformation.FormDigestValue);
}
