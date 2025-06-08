import * as React from "react";
import { getDigest } from "../Crud/GetDigest";
import styles from "../Styles/Counter.module.scss";
import { addOrUpdateItemInVirtualInventory } from "../Crud/AddData";
import { extractQuantity } from "../utils/ExtractQuantity";

class Counter extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.quantity = extractQuantity(props.Title || "");

    this.state = {
      count: props.initialCount,
      displayCount: props.initialCount,
      loading: !props.initialCount,
    };
  }

  quantity = 1;

  private listName = "shoping";
  private webUrl = "https://crm.zarsim.com";

  async componentDidMount() {
    if (!this.props.initialCount) {
      this.fetchQuantity();
    }

    this.fetchQuantity();
  }

  fetchQuantity = () => {
    const { Id } = this.props;

    fetch(
      `${this.webUrl}/_api/web/lists/getbytitle('${this.listName}')/items(${Id})`,
      {
        headers: {
          Accept: "application/json;odata=verbose",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const totalCount = Number(data.d.count) || 0;
        const count = Math.floor(totalCount / this.quantity);
        this.setState({ count, displayCount: count, loading: false });
        if (this.props.onCountChange) {
          this.props.onCountChange(count);
        }
      })
      .catch((error) => {
        console.error("Fetch quantity error:", error);
        this.setState({ loading: false });
      });
  };

  updateQuantity = async (newCount: number) => {
    const digest = await getDigest();
    const { Id, onDelete, onCountChange, updateCartCount } = this.props;
    const url = `${this.webUrl}/_api/web/lists/getbytitle('${this.listName}')/items(${Id})`;

    if (newCount === 0) {
      fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "X-RequestDigest": digest,
          "IF-MATCH": "*",
          "X-HTTP-Method": "DELETE",
        },
      })
        .then(() => {
          this.setState({ count: 0, displayCount: 0 });
          if (onDelete) onDelete(Id);
          if (updateCartCount) updateCartCount();
        })
        .catch((error) => console.error("Delete item error:", error));
    } else {
      fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digest,
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE",
        },
        body: JSON.stringify({
          __metadata: { type: "SP.Data.ShopingListItem" },
          count: String(newCount * this.quantity),
        }),
      })
        .then(() => {
          this.setState({ count: newCount, displayCount: newCount });
          if (onCountChange) onCountChange(newCount);
        })
        .catch((error) => console.error("Update quantity error:", error));
    }
  };

  increment = async () => {
    const { setWarning } = this.props;
    const { displayCount } = this.state;
    const maxCount = parseInt(this.props.availableInventory, 10) || Infinity;
    const newCount = displayCount + 1;

    if (newCount > maxCount) {
      setWarning("مقدار انتخاب‌شده بیشتر از موجودی قابل سفارش است.");
      return;
    }

    setWarning("");
    await this.updateQuantity(newCount);
    this.props.onUpdateItem && this.props.onUpdateItem(); // ✅ اضافه شد
  };

  decrement = () => {
    const current = this.state.displayCount;
    if (current === 1) {
      this.setState({ displayCount: 0 });
      this.updateQuantity(0);
      this.props.onUpdateItem && this.props.onUpdateItem(); // ✅ اضافه شد
    } else {
      const newCount = Math.max(0, current - 1);
      this.updateQuantity(newCount);
      this.props.onUpdateItem && this.props.onUpdateItem(); // ✅ اضافه شد
    }
  };

  handleInputChange = (e) => {
    const { setWarning } = this.props;
    const value = parseInt(e.target.value, 10);
    const maxCount = parseInt(this.props.availableInventory, 10) || Infinity;
    const newCount = isNaN(value) || value < 0 ? 0 : value;

    if (newCount > maxCount) {
      setWarning("مقدار انتخاب‌شده بیشتر از موجودی قابل سفارش است.");

      this.setState({ displayCount: maxCount });
    } else {
      setWarning("");
      this.setState({ displayCount: newCount, count: newCount });
    }
  };

  handleInputBlur = async () => {
    const { ProductCode, Title, setchangeOrdarableInventory } = this.props;
    const { displayCount } = this.state;

    await this.updateQuantity(displayCount);
    this.props.onUpdateItem && this.props.onUpdateItem(); // ✅ اضافه شد

    const guid_form = localStorage.getItem("userGuid");

    await addOrUpdateItemInVirtualInventory({
      guid_form: String(guid_form),
      ProductCode: String(ProductCode),
      status: 0,
      reserveInventory: String(displayCount * this.quantity), // ضرب در quantity
      Title: String(Title),
    });

    setchangeOrdarableInventory(displayCount);
  };

  render() {
    const { displayCount, loading } = this.state;
    if (loading) return <div>Loading...</div>;

    return (
      <div className={styles.buttonContainer}>
        <button
          className={styles.counterBtn}
          type="button"
          onClick={this.decrement}
        >
          -
        </button>
        <input
          className={styles.counterInput}
          type="text"
          min={0}
          value={displayCount}
          onChange={this.handleInputChange}
          onBlur={this.handleInputBlur}
        />
        <button
          className={styles.counterBtn}
          type="button"
          onClick={this.increment}
        >
          +
        </button>
      </div>
    );
  }
}

export default Counter;
