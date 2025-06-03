// CartCard.tsx
import * as React from "react";
import { CartItemProps } from "../IDistributerProps";
import styles from "../Styles/Cart.module.scss";
import Counter from "../Product/Counter";

export default class CartCard extends React.Component<CartItemProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      warning: "",
    };
  }

  setWarning = (message: string) => {
    this.setState({ warning: message });
  };

  render() {
    const { product, onDelete, onUpdateItem } = this.props;
    const { Title, Code, Id, codegoods } = product;

    return (
      <div className={styles.cardContainer}>
        <div className={styles.cardDescription}>
          <p>{Title}</p>
          {this.state.warning && (
            <div className={styles.warningMessage}>⚠️ {this.state.warning}</div>
          )}
          <p>کدکالا: {codegoods}</p>
        </div>
        <div className={styles.cartCounterActions}>
          <button
            type="button"
            onClick={() => onDelete(Id)}
            className={styles.deleteBtn}
          >
            حذف
          </button>
          <Counter
            onUpdateItem={onUpdateItem}
            setWarning={this.setWarning}
            Title={Title}
            ProductCode={Code}
            Id={Id}
            onDelete={onDelete}
            availableInventory=""
            setchangeOrdarableInventory={() => {}}
          />
        </div>
      </div>
    );
  }
}
