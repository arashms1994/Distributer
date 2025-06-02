import * as React from "react";
import { Product } from "../IDistributerProps";
import Counter from "./Counter";
import styles from "../Styles/Product.module.scss";
import { getInventoryByCode } from "../Crud/GetData";
import { addOrUpdateItemInOrderableInventory } from "../Crud/AddData";

const webUrl = "https://crm.zarsim.com";
const listName = "shoping";
const itemType = "SP.Data.ShopingListItem";

export default class ProductCard extends React.Component<
  Product & { distributerPrice: any },
  any
> {
  constructor(props) {
    super(props);
    this.state = {
      showCounter: false,
      itemId: null,
      showMessage: false,
      availableInventory: "",
      changeOrdarableInventory: false,
      displayCount: "",
      warning: "",
    };
  }

  async componentDidMount() {
    const { Code } = this.props;
    const availableInventory = await getInventoryByCode(Code);

    this.setState({ availableInventory });
    console.log("availableInventory:", availableInventory);

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

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.changeOrdarableInventory !==
        this.state.changeOrdarableInventory &&
      this.state.changeOrdarableInventory === true
    ) {
      this.handleChangeOrderableInventory();
    }
  }

  async handleChangeOrderableInventory() {
    const { Code } = this.props;
    const { displayCount, availableInventory } = this.state;

    const previousInventory = parseInt(availableInventory, 10);
    const currentCount = parseInt(displayCount, 10);
    const reduceAmount = currentCount; // یا اگر تفاوت می‌خواهید: currentCount - previousInventory

    if (!isNaN(reduceAmount) && reduceAmount > 0) {
      const updatedInventory = await addOrUpdateItemInOrderableInventory({
        Code,
        orderableInventory: String(reduceAmount),
      });

      this.setState({
        changeOrdarableInventory: false,
        availableInventory: updatedInventory,
      });
    }
  }

  handleAddToCart = async () => {
    const { Title, Code, productgroup, IdCode, size, color, distributerPrice } =
      this.props;

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

  getDisplayInventory() {
    const { availableInventory } = this.state;
    const { Inventory } = this.props;

    if (
      availableInventory !== null &&
      availableInventory !== undefined &&
      String(availableInventory).trim() !== ""
    ) {
      return availableInventory;
    }

    return Inventory;
  }

  setchangeOrdarableInventory = (displayCount) => {
    this.setState({
      changeOrdarableInventory: true,
      displayCount: displayCount,
    });
  };

  setWarning = (message: string) => {
    this.setState({ warning: message });
  };

  render() {
    const { Title, Code, image, Price, distributerPrice, Inventory } =
      this.props;
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

            <p className={styles.codeDescription}>
              موجودی(متر): {this.getDisplayInventory()}
            </p>
            {this.state.warning && (
              <div className={styles.warningMessage}>
                ⚠️ {this.state.warning}
              </div>
            )}

            <p className={styles.codeDescription}>قیمت : {Price} تومان</p>
            <p className={styles.codeDescription}>
              قیمت برای شما:{" "}
              {distributerPrice !== undefined && distributerPrice !== null
                ? `${distributerPrice} تومان`
                : "تعریف نشده"}
            </p>
            <p className={styles.codeDescription}>کدکالا: {Code}</p>
          </a>
        </div>

        <div className={styles.counterActions}>
          {showCounter && itemId ? (
            <Counter
              setchangeOrdarableInventory={this.setchangeOrdarableInventory}
              Title={Title}
              ProductCode={Code}
              Id={itemId}
              onDelete={this.handleCounterDeleted}
              updateCartCount={this.props.updateCartCount}
              availableInventory={this.state.availableInventory}
              setWarning={this.setWarning} // 👈 اضافه شود
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
