import * as React from "react";
import { CartItemProps } from "../IDistributerProps";
import styles from "../Styles/Cart.module.scss";
import Counter from "../Product/Counter";

export default class CartCard extends React.Component<CartItemProps, any> {
  render() {
    const { product, onDelete } = this.props;

    return (
      <div className={styles.cardContainer}>
        <div className={styles.cardDescription}>
          <p className={styles.titleDescription}>{product.Title}</p>
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
            Title={product.Title}
            Id={product.Id}
            ProductCode={product.codegoods}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }
}
