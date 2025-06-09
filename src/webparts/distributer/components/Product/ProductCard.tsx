import * as React from "react";
import { Product } from "../IDistributerProps";
import Counter from "./Counter";
import styles from "../Styles/Product.module.scss";
import { loadItemByCode, loadReserveInventoryByCode } from "../Crud/GetData";
import { formatNumberWithComma } from "../utils/formatNumberWithComma";

const webUrl = "https://crm.zarsim.com";
const listName = "shoping";
const itemType = "SP.Data.ShopingListItem";

export default class ProductCard extends React.Component<
  Product & { nameId?: string; updateCartCount?: () => void },
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
      distributerPrice: null,
    };
  }

  async componentDidMount() {
    const { Code, nameId } = this.props;

    try {
      const ItemStore = await loadItemByCode(Code);
      if (!ItemStore || typeof ItemStore.Inventory === "undefined") {
        console.warn("کالا با این کد پیدا نشد یا موجودی تعریف نشده است:", Code);
        return;
      }

      const actualInventory = ItemStore.Inventory;

      const reserveItems = await loadReserveInventoryByCode(Code);
      const totalReserveInventory = reserveItems.reduce(
        (sum, item) => sum + (Number(item.reserveInventory) || 0),
        0
      );

      const updatedInventory = Number(actualInventory - totalReserveInventory);

      const priceColumn = nameId.toUpperCase();
      const distributerPrice = ItemStore[priceColumn];

      this.setState({
        changeOrdarableInventory: false,
        availableInventory: updatedInventory,
        distributerPrice: distributerPrice,
      });

      const userGuid = localStorage.getItem("userGuid");
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
      console.error("خطا در componentDidMount ProductCard:", err);
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

    const ItemStore = await loadItemByCode(Code);
    const actualInventory = ItemStore.Inventory;

    const toatalReserveInventoryByProductCode =
      await loadReserveInventoryByCode(Code);
    const totalReserveInventory = toatalReserveInventoryByProductCode.reduce(
      (sum, item) => {
        return sum + (Number(item.reserveInventory) || 0);
      },
      0
    );

    const updatedInventory = Number(actualInventory - totalReserveInventory);

    this.setState({
      changeOrdarableInventory: false,
      availableInventory: updatedInventory,
    });
  }

  handleAddToCart = async () => {
    const { Title, Code, productgroup, IdCode, size, color } = this.props;
    const { distributerPrice } = this.state;

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
            price: distributerPrice,
          }),
        }
      );

      const added = await addRes.json();
      this.setState({
        showCounter: true,
        itemId: added.d.ID,
        showMessage: true,
        initialCount: 1,
      });

      if (this.props.updateCartCount) {
        this.props.updateCartCount();
        await this.handleChangeOrderableInventory();
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
    const { Title, Code, image, Price } = this.props;
    const {
      showCounter,
      itemId,
      showMessage,
      warning,
      availableInventory,
      distributerPrice,
    } = this.state;

    const productLink = `${window.location.origin}${window.location.pathname}#/product-details/${Code}`;
    const displayInventory = this.getDisplayInventory();

    return (
      <div className={styles.cardContainer}>
        {/*================= Header with Image =============*/}
        <div className={styles.cardHeader}>
          <a
            className={styles.productCardLink}
            href={productLink}
            rel="noopener noreferrer"
          >
            <img src={image} alt={Title} className={styles.productCardImg} />
          </a>
        </div>

        {/*================= Product Description =================*/}
        <div className={styles.cardDescription}>
          <a
            className={styles.productCardLink}
            href={productLink}
            rel="noopener noreferrer"
          >
            <p className={styles.titleDescription}>{Title}</p>
            <p className={styles.codeDescription}>
              موجودی(متر): {displayInventory}
            </p>

            {warning && (
              <div className={styles.warningMessage}>⚠️ {warning}</div>
            )}

            <p className={styles.codeDescription}>
              قیمت: {formatNumberWithComma(Number(Price))} ریال
            </p>

            <p className={styles.codeDescription}>
              قیمت برای شما: {" "}
              {distributerPrice !== undefined && distributerPrice !== null
                ? `${formatNumberWithComma(Number(distributerPrice))} ریال`
                : "تعریف نشده"}
            </p>

            <p className={styles.codeDescription}>کدکالا: {Code}</p>
          </a>
        </div>

        {/*================ Counter / Add to Cart ==================*/}
        <div className={styles.counterActions}>
          {showCounter && itemId ? (
            <Counter
              setchangeOrdarableInventory={this.setchangeOrdarableInventory}
              Title={Title}
              ProductCode={Code}
              Id={itemId}
              onDelete={this.handleCounterDeleted}
              updateCartCount={this.props.updateCartCount}
              availableInventory={availableInventory}
              setWarning={this.setWarning}
              initialCount={this.state.initialCount}
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

        {/*======= Success Message =============*/}
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
