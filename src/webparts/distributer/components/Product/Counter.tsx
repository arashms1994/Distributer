import * as React from "react";
import { getDigest } from "../Crud/GetDigest";
import styles from "../Styles/Counter.module.scss";
import { addOrUpdateItemInVirtualInventory } from "../Crud/AddData";

export default class Counter extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      count: 1, // مقدار پیش‌فرض
    };

    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.notifyCountChange = this.notifyCountChange.bind(this);
  }

  increment() {
    var newCount = this.state.count + 1;
    this.setState({ count: newCount }, this.notifyCountChange);
  }

  decrement() {
    if (this.state.count > 1) {
      var newCount = this.state.count - 1;
      this.setState({ count: newCount }, this.notifyCountChange);
    }
  }

  handleInputChange(e) {
    var value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      this.setState({ count: value }, this.notifyCountChange);
    }
  }

  notifyCountChange() {
    this.props.onCountChange(this.state.count);
  }

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
