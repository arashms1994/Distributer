import { getDigest } from "./GetDigest";

export async function handleUpdateItem() {
  const listName = "MyList";
  const itemType = `SP.Data.${listName}ListItem`;
  const webUrl = "http://pm.isa.ir/development";
  const { title, currentItemId } = this.state;

  if (!title.trim()) {
    this.setState({ message: "لطفاً یک عنوان وارد کنید." });
    return;
  }

  getDigest()
    .then((digest) =>
      fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${currentItemId})`,
        {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE",
          },
          body: JSON.stringify({
            __metadata: { type: itemType },
            Title: title,
          }),
        }
      )
    )
    .then(() => {
      this.setState({
        message: `آیتم (${title}) ویرایش شد.`,
        title: "",
        isEditing: false,
        currentItemId: null,
      });
      this.loadItems();
    })
    .catch((err) => this.setState({ message: `خطا: ${err.message}` }));
}
