import React = require("react");
import styles from "../components/Styles/FileUpload.module.scss";

export class FileUploader extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      uploadStatus: "",
      uploadProgress: 0,
    };
  }

  uploadFile = () => {
    const selectedFile = this.state.selectedFile;
    const orderNumber = this.props.orderNumber;

    if (!selectedFile || !orderNumber) {
      this.setState({ uploadStatus: "لطفاً فایل و شماره سفارش را وارد کنید" });
      return;
    }

    const cleanOrderNumber = orderNumber.replace(/[#%*<>?\/\\|]/g, "_");
    const webUrl = "https://crm.zarsim.com";
    const libraryName = "Attach1";
    const subFolder = "first-upload";
    const fullFolderPath = `${libraryName}/${cleanOrderNumber}/${subFolder}`;

    fetch(`${webUrl}/_api/contextinfo`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const digest = data.d.GetContextWebInformation.FormDigestValue;

        return fetch(
          `${webUrl}/_api/web/folders/add('${libraryName}/${cleanOrderNumber}')`,
          {
            method: "POST",
            headers: {
              Accept: "application/json;odata=verbose",
              "X-RequestDigest": digest,
            },
          }
        )
          .catch(() => {})
          .then(() =>
            fetch(`${webUrl}/_api/web/folders/add('${fullFolderPath}')`, {
              method: "POST",
              headers: {
                Accept: "application/json;odata=verbose",
                "X-RequestDigest": digest,
              },
            }).catch(() => {})
          )
          .then(() => ({ digest }));
      })
      .then(async ({ digest }) => {
        const cleanFileName = selectedFile.name.replace(/[#%*<>?\/\\|]/g, "_");
        const arrayBuffer = await selectedFile.arrayBuffer();

        return fetch(
          `${webUrl}/_api/web/GetFolderByServerRelativeUrl('${fullFolderPath}')/Files/add(overwrite=true, url='${cleanFileName}')`,
          {
            method: "POST",
            body: arrayBuffer,
            headers: {
              Accept: "application/json;odata=verbose",
              "X-RequestDigest": digest,
            },
          }
        );
      })
      .then((uploadRes) => {
        if (uploadRes.ok) {
          this.setState({
            uploadStatus: "✅ فایل با موفقیت آپلود شد",
            uploadProgress: 100,
          });
        } else {
          throw new Error("خطا در آپلود فایل");
        }
      })
      .catch((error) => {
        console.error("خطا:", error);
        this.setState({
          uploadStatus: "❌ خطا در آپلود فایل",
          uploadProgress: 0,
        });
      });
  };

  render() {
    return (
      <div>
        <input
        className={styles.FileUploadInput}
          type="file"
          onChange={(e) =>
            this.setState({
              selectedFile: (e.target as HTMLInputElement).files[0],
            })
          }
        />
        <button onClick={this.uploadFile}>آپلود</button>
        <div>{this.state.uploadStatus}</div>
      </div>
    );
  }
}
