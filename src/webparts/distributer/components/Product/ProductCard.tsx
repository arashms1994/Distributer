import * as React from "react";
import { Product } from "../IDistributerProps";
import Counter from "./Counter";
import styles from "../Styles/Product.module.scss";

const webUrl = "https://crm.zarsim.com";
const listName = "shoping";
const itemType = "SP.Data.ShopingListItem";

export default class ProductCard extends React.Component<Product, any> {
  constructor(props) {
    super(props);
    this.state = {
      showCounter: false,
      itemId: null,
      showMessage: false,
    };
  }

  async componentDidMount() {
    const { Code } = this.props;
    const userGuid = localStorage.getItem("userGuid");
    try {
      const checkRes = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=guid_form eq '${userGuid}' and codegoods eq '${Code}'`,
        {
          headers: { Accept: "application/json;odata=verbose" },
        }
      );

      const result = await checkRes.json();
      if (result.d.results.length > 0) {
        this.setState({
          itemId: result.d.results[0].ID,
          showCounter: true,
        });
      }
    } catch (err) {
      console.error("خطا در بررسی سبد خرید:", err);
    }
  }

  handleAddToCart = async () => {
    const { Title, Code, productgroup, IdCode, size, color } = this.props;
    const userGuid = localStorage.getItem("userGuid");

    try {
      const res = await fetch(`${webUrl}/_api/contextinfo`, {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
        },
      });
      const data = await res.json();
      const digest = data.d.GetContextWebInformation.FormDigestValue;

      const addRes = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items`,
        {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
          },
          body: JSON.stringify({
            __metadata: { type: itemType },
            Title,
            codegoods: Code,
            count: "1",
            guid_form: userGuid,
            productgroup,
            IdCode,
            size,
            color,
          }),
        }
      );

      const added = await addRes.json();
      this.setState({
        showCounter: true,
        itemId: added.d.ID,
        showMessage: true,
      });

      if (this.props.updateCartCount) {
        this.props.updateCartCount();
      }

      setTimeout(() => {
        this.setState({ showMessage: false });
      }, 3000);
    } catch (err) {
      console.error("خطا در افزودن:", err);
    }
  };

  handleCounterDeleted = () => {
    this.setState({ showCounter: false, itemId: null });
  };

  render() {
    const { Title, Code, image } = this.props;
    const { showCounter, itemId, showMessage } = this.state;

    return (
      <div className={styles.cardContainer}>
        <div className={styles.cardHeader}>
          <a
            className={styles.productCardLink}
            href={`${window.location.origin}${window.location.pathname}#/product-details/${Code}`}
            rel="noopener noreferrer"
          >
            <img src={image} alt={Title} className={styles.productCardImg} />
          </a>
        </div>

        <div className={styles.cardDescription}>
          <a
            className={styles.productCardLink}
            href={`${window.location.origin}${window.location.pathname}#/product-details/${Code}`}
            rel="noopener noreferrer"
          >
            <p className={styles.titleDescription}>{Title}</p>
            <p className={styles.codeDescription}>کدکالا: {Code}</p>
          </a>
        </div>

        <div className={styles.counterActions}>
          {showCounter && itemId ? (
            <Counter
              Id={itemId}
              onDelete={this.handleCounterDeleted}
              updateCartCount={this.props.updateCartCount} // ✅ اضافه شد
            />
          ) : (
            <button
              type="button"
              className={styles.cardBtn}
              onClick={this.handleAddToCart}
            >
              افزودن به سبد خرید
            </button>
          )}
        </div>

        {showMessage && (
          <div className={styles.successMessage}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="green"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17L4 12" />
            </svg>
            <span>کالا با موفقیت به سبد خرید اضافه شد</span>
            <button
              className={styles.closeBtn}
              onClick={() => this.setState({ showMessage: false })}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }
}
