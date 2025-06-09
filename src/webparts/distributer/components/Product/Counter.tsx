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
    const { initialCount, onCountChange } = this.props;

    if (initialCount) {
      if (onCountChange) onCountChange(initialCount);
    } else {
      this.fetchQuantity();
    }
  }

  updateReserveInventory = async (newCount: number) => {
    const { ProductCode, Title, setchangeOrdarableInventory } = this.props;
    const guid_form = localStorage.getItem("userGuid");

    await addOrUpdateItemInVirtualInventory({
      guid_form: String(guid_form),
      ProductCode: String(ProductCode),
      status: 0,
      reserveInventory: String(newCount * this.quantity), // ضرب در تعداد واقعی
      Title: String(Title),
    });

    if (typeof setchangeOrdarableInventory === "function") {
      setchangeOrdarableInventory(newCount);
    }
  };

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
    await this.updateReserveInventory(newCount);
  };

  decrement = async () => {
    const { displayCount } = this.state;
    const newCount = Math.max(0, displayCount - 1);

    await this.updateQuantity(newCount);
    await this.updateReserveInventory(newCount);
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
    const { displayCount } = this.state;

    await this.updateQuantity(displayCount);
    await this.updateReserveInventory(displayCount);
  };

  render() {
    return (
      <div className={styles.buttonContainer}>
        <button className={styles.counterBtn} onClick={this.increment}>
          +
        </button>

        <input
          type="number"
          min="1"
          className={styles.counterInput}
          value={this.state.count}
          onChange={this.handleInputChange}
        />

        <button className={styles.counterBtn} onClick={this.decrement}>
          -
        </button>
      </div>
    );
  }
}
