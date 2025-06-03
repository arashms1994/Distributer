import * as React from "react";
import { CartItemProps } from "../IDistributerProps";
import styles from "../Styles/Cart.module.scss";
import Counter from "../Product/Counter";

export default class CartCard extends React.Component<CartItemProps, any> {
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
    const { product, onDelete } = this.props;
    const { Title, Code, Id } = product;
    const itemId = Id;
    return (
      <div className={styles.cardContainer}>
        <div className={styles.cardDescription}>
          <p className={styles.titleDescription}>{product.Title}</p>
          {this.state.warning && (
            <div className={styles.warningMessage}>⚠️ {this.state.warning}</div>
          )}
          <p>کدکالا: {product.codegoods}</p>
        </div>

        <div className={styles.cartCounterActions}>
          <button
            onClick={() => onDelete(product.Id)}
            className={styles.deleteBtn}
          >
            حذف
          </button>

          <Counter
            onUpdateItem={this.props.onUpdateItem}
            setchangeOrdarableInventory={this.setchangeOrdarableInventory}
            Title={Title}
            ProductCode={Code}
            Id={itemId}
            onDelete={onDelete}
            availableInventory={this.state.availableInventory}
            setWarning={this.setWarning} // 👈 اضافه شود
          />
        </div>
      </div>
    );
  }
}
