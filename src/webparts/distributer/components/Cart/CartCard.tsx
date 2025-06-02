import * as React from "react";
import { CartItemProps } from "../IDistributerProps";
import styles from "../Styles/Cart.module.scss";
import Counter from "../Product/Counter";

export default class CartCard extends React.Component<CartItemProps, any> {
  render() {
    const { product, onDelete, onCountChange } = this.props;

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
            Id={product.Id}
            onDelete={onDelete}
            onCountChange={(count) => onCountChange(product.Id, count)} 
            guid_form={localStorage.getItem("userGuid")}
            Title={product.Title}
            codegoods={product.codegoods}
          />
        </div>
      </div>
    );
  }
}
