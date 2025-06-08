import * as React from "react";
import {
  getInventoryByCode,
  loadImages,
  loadItemByCode,
} from "../Crud/GetData";
import styles from "../Styles/ProductPage.module.scss";
import { Image } from "../IDistributerProps";
import { formatNumberWithComma } from "../utils/formatNumberWithComma";

export default class ProductPage extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      loading: true,
      error: "",
      imageUrl: undefined,
      availableInventory: "",
    };
  }

  async extractWireDetails(title: string) {
    const regex = /(\d+(\.\d+)?)\s*\*\s*(\d+)/;
    const match = title.match(regex);

    if (match) {
      return {
        ghotreshte: match[1],
        number_x002f_stringdiameter: match[3],
      };
    }

    return {
      ghotreshte: null,
      number_x002f_stringdiameter: null,
    };
  }

  async componentDidMount() {
    const { Code } = this.props.params;

    try {
      const availableInventory = await getInventoryByCode(Code);
      this.setState({ availableInventory });
      console.log("availableInventory", availableInventory);

      const item = await loadItemByCode(Code);
      console.log("item", item);
      const imageUrl: Image[] = await loadImages();

      const extracted = this.extractWireDetails(item.Title || "");

      this.setState({
        imageUrl,
        item: {
          ...item,
          ghotreshte: item.ghotreshte || (await extracted).ghotreshte,
          number_x002f_stringdiameter:
            item.number_x002f_stringdiameter ||
            (await extracted).number_x002f_stringdiameter,
        },
        loading: false,
      });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }

  render() {
    const { item, loading, error, imageUrl, availableInventory } = this.state;

    if (loading) return <p>در حال بارگذاری...</p>;
    if (error) return <p>خطا :{error}</p>;
    if (!item) return <p>محصولی یافت نشد</p>;

    const {
      productgroup,
      Title,
      color,
      thermalclass,
      ghotreshte,
      size,
      number_x002f_stringdiameter,
      Code,
      IdCode,
      Inventory,
      Price,
      distributerPrice,
    } = item;

    let modifiedThermalClass = thermalclass;

    if (Title) {
      const upperTitle = Title.toUpperCase();

      if (upperTitle.includes("AVSS")) {
        modifiedThermalClass = "حداکثر دما 80 درجه سانتیگراد";
      } else if (upperTitle.includes("AVS")) {
        modifiedThermalClass = "حداکثر دما 80 درجه سانتیگراد";
      } else if (upperTitle.includes("AV")) {
        modifiedThermalClass = "حداکثر دما 80 درجه سانتیگراد";
      } else if (upperTitle.includes("T3")) {
        modifiedThermalClass = "حداکثر دما 125 درجه سانتیگراد";
      } else if (upperTitle.includes("T2")) {
        modifiedThermalClass = "حداکثر دما 100 درجه سانتیگراد";
      } else if (upperTitle.includes("T1")) {
        modifiedThermalClass = "حداکثر دما 85 درجه سانتیگراد";
      }
    }

    const matchedImages =
      imageUrl && Array.isArray(imageUrl)
        ? imageUrl
            .map((img) => (img.name === `${IdCode}.jpg` ? img : null))
            .filter((img) => img !== null)
        : [];

    const matchedImage = matchedImages.length > 0 ? matchedImages[0] : null;

    return (
      <div className={styles.productPageContainer}>
        <div className={styles.productImageDiv}>
          {matchedImage ? (
            <img
              className={styles.productImage}
              src={matchedImage.url}
              alt={Title}
            />
          ) : (
            <p>تصویری موجود نیست</p>
          )}
        </div>

        <div className={styles.productDetails}>
          <h4 className={styles.productDetailsH4}>{Title}</h4>
          <p className={styles.productDetailsP}>
            دسته بندی:
            <span className={styles.productDetailsSPAN}>
              {productgroup ? (
                `${productgroup}`
              ) : (
                <small className={styles.productDetailsSMALL}>تعریف نشده</small>
              )}
            </span>
          </p>

          <p className={styles.productDetailsP}>
            رنگ:
            <span className={styles.productDetailsSPAN}>
              {color ? (
                color
              ) : (
                <small className={styles.productDetailsSMALL}>
                  تعریف نشده{" "}
                </small>
              )}
            </span>
          </p>

          <p className={styles.productDetailsP}>
            کدکالا: <span className={styles.productDetailsSPAN}>{Code}</span>
          </p>

          <p className={styles.productDetailsP}>
            قیمت:{" "}
            <span className={styles.productDetailsSPAN}>
              {formatNumberWithComma(Number(Price))}
            </span>
          </p>

          <p className={styles.productDetailsP}>
            قیمت برای شما:
            <span className={styles.productDetailsSPAN}>
              {formatNumberWithComma(Number(distributerPrice)) || (
                <small className={styles.productDetailsSMALL}>تعریف نشده</small>
              )}
            </span>
          </p>

          <p className={styles.productDetailsP}>
            موجودی(متر):
            <span className={styles.productDetailsSPAN}>
              {availableInventory !== "" && availableInventory !== null
                ? availableInventory
                : Inventory}
            </span>
          </p>

          <div style={{ display: "flex", flexDirection: "row-reverse" }}>
            <p className={styles.productDetailsP}>سایز: </p>
            <p className={styles.productDetailsP}>
              <span className={styles.productDetailsSPAN}>
                {size ? (
                  size
                ) : (
                  <small className={styles.productDetailsSMALL}>
                    تعریف نشده
                  </small>
                )}
              </span>
            </p>
          </div>

          <p className={styles.productDetailsP}>
            کلاس حرارتی:
            <span className={styles.productDetailsSPAN}>
              {modifiedThermalClass ? (
                modifiedThermalClass
              ) : (
                <small className={styles.productDetailsSMALL}>
                  تعریف نشده{" "}
                </small>
              )}
            </span>
          </p>

          <p className={styles.productDetailsP}>
            تعداد رشته:
            <span className={styles.productDetailsSPAN}>
              {number_x002f_stringdiameter ? (
                number_x002f_stringdiameter
              ) : (
                <small className={styles.productDetailsSMALL}>
                  تعریف نشده{" "}
                </small>
              )}
            </span>
          </p>

          <p className={styles.productDetailsP}>
            قطر رشته:
            <span className={styles.productDetailsSPAN}>
              {ghotreshte ? (
                ghotreshte
              ) : (
                <small className={styles.productDetailsSMALL}>
                  تعریف نشده{" "}
                </small>
              )}
            </span>
          </p>
        </div>
      </div>
    );
  }
}
